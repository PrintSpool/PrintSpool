#![type_length_limit="15941749"]
// #[macro_use] extern crate tracing;
// #[macro_use] extern crate derive_new;

mod mutation;
mod query;

use std::{env, sync::Arc};
use serde::Deserialize;
use sqlx::SqlitePool;
use arc_swap::ArcSwap;
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};
use futures_util::{
    future,
    // future::Future,
    future::FutureExt,
    future::join_all,
    // SinkExt,
    stream::{
        // Stream,
        StreamExt,
        // TryStreamExt,
    },
    select,
};
use teg_auth::{AuthContext, watch_pem_keys};
use teg_machine::{MachineMap, MachineMapLocal, machine::Machine};

const CONFIG_DIR: &'static str = "/etc/teg/";

pub type DbId = teg_json_store::DbId;

#[derive(Deserialize)]
struct IdFromConfig {
    id: crate::DbId,
}

fn main() -> Result<()> {
    dotenv::dotenv().ok();
    async_std::task::block_on(app())
}

async fn app() -> Result<()> {
    let db = SqlitePool::connect(&env::var("DATABASE_URL")?).await?;

    let machine_ids: Vec<crate::DbId> = std::fs::read_dir(CONFIG_DIR)?
        .map(|entry| {
            let entry = entry?;
            let file_name = entry.file_name().to_str()
                .ok_or_else(|| anyhow!("Invalid file name in config dir"))?
                .to_string();

            if
                entry.file_type()?.is_file()
                && file_name.starts_with("machine-")
                && file_name.ends_with(".toml")
            {
                let config_file = std::fs::read_to_string(
                    format!("{}{}", CONFIG_DIR, file_name)
                )?;

                let IdFromConfig { id, .. } = serde_json::from_str(&config_file)?;
                Ok(Some(id))
            } else {
                Ok(None)
            }
        })
        .filter_map(|result| result.transpose())
        .collect::<Result<_>>()?;

    let db_clone = db.clone();
    let machines = machine_ids
        .into_iter()
        .map(|machine_id| {
            let db_clone = db_clone.clone();
            async move {
                let machine = Machine::start(db_clone, &machine_id)
                    .await?;
                Result::<_>::Ok((async_graphql::ID::from(machine_id), machine))
            }
        });

    let machines: MachineMapLocal = join_all(machines)
        .await
        .into_iter()
        .collect::<Result<_>>()?;

    let machines: MachineMap = Arc::new(ArcSwap::new(Arc::new(machines)));

    let schema = async_graphql::Schema::new(
        <query::Query>::default(),
        <mutation::Mutation>::default(),
        async_graphql::EmptySubscription,
    );

    let (
        auth_pem_keys,
        auth_pem_keys_watcher,
    ) = watch_pem_keys().await?;

    let machines_clone = machines.clone();

    let signalling_future = teg_data_channel::listen_for_signalling(
        &machines,
        move |message_stream| {
            let schema = schema.clone();
            let db = db.clone();
            let auth_pem_keys = auth_pem_keys.clone();
            let machines = machines_clone.clone();
            let initializer = |init_payload| async move {
                #[derive(Deserialize)]
                struct InitPayload {
                    auth_token: String,
                    identity_public_key: Option<String>,
                }

                let InitPayload {
                    auth_token,
                    identity_public_key,
                } = serde_json::from_value(init_payload)?;

                let user = teg_auth::user::User::authenticate(
                    &db,
                    auth_pem_keys,
                    auth_token,
                    &identity_public_key,
                ).await?;

                let auth_context = AuthContext::new(
                    user,
                    identity_public_key,
                );

                let mut data = async_graphql::Data::default();

                data.insert(db.clone());
                data.insert(auth_context);
                data.insert(machines);

                Ok(data)
            };

            let connection = async_graphql::http::WebSocket::with_data(
                schema,
                message_stream,
                initializer,
                async_graphql::http::WebSocketProtocols::GraphQLWS,
            )
                .map(|msg| msg.into_bytes());

            future::ok(connection)
        },
    );

    let res = select! {
        res = auth_pem_keys_watcher.fuse() => res,
        res = signalling_future.fuse() => res,
    };

    res?;
    Ok(())
}
