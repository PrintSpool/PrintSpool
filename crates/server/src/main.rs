#![type_length_limit="15873664"]
// #[macro_use] extern crate tracing;
// #[macro_use] extern crate derive_new;

mod mutation;
mod query;

use async_std::task::block_on;
use futures_util::future::join_all;
use serde::Deserialize;
use sqlx::SqlitePool;
use teg_auth::watch_pem_keys;
use std::{env, sync::Arc};
use arc_swap::ArcSwap;
use teg_machine::{
    // config::MachineConfig,
    machine::Machine,
};
use std::collections::HashMap;

use anyhow::{
    anyhow,
    Result,
    // Context as _,
};
// use serde::{Serialize, Deserialize};
// use teg_machine::machine::messages::GetData;
// use std::fs;
// use chrono::{
//     Duration,
//     Utc
// };
use futures_util::{
    future::Future,
    future::FutureExt,
    // future::try_join_all,
    // SinkExt,
    stream::{
        // Stream,
        StreamExt,
        // TryStreamExt,
    },
    select,
};

const CONFIG_DIR: &'static str = "/etc/teg/";

#[derive(Deserialize)]
struct IdFromConfig {
    id: i32
}

fn main() -> Result<()> {
    dotenv::dotenv().ok();
    async_std::task::block_on(app())
}

async fn app() -> Result<()> {
    let db = SqlitePool::connect(&env::var("DATABASE_URL")?).await?;

    let machine_ids: Vec<i32> = std::fs::read_dir(CONFIG_DIR)?
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
                let machine = Machine::start(db_clone, machine_id)
                    .await?;
                Result::<_>::Ok((async_graphql::ID::from(machine_id), machine))
            }
        });

    let machines: HashMap<async_graphql::ID, xactor::Addr<Machine>> = join_all(machines)
        .await
        .into_iter()
        .collect::<Result<_>>()?;

    let machines = ArcSwap::new(Arc::new(machines));

    let schema = async_graphql::Schema::new(
        <query::Query>::default(),
        <mutation::Mutation>::default(),
        async_graphql::EmptySubscription,
    );

    let (
        auth_pem_keys,
        auth_pem_keys_watcher,
    ) = watch_pem_keys().await?;

    let signalling_future = teg_data_channel::listen_for_signalling(
        &machines,
        move |message_stream| {
            let schema = schema.clone();
            let db = db.clone();
            let auth_pem_keys = auth_pem_keys.clone();
            async move {
                let initializer = |init_payload| async move {
                    // block_on(async move {
                        // pub async fn authenticate(
                        //     db: &crate::Db,
                        //     auth_pem_keys: &ArcSwap<Vec<Vec<u8>>>,
                        //     auth_token: String,
                        //     identity_public_key: String
                        // ) -> Result<Option<User>> {

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
                            identity_public_key,
                        ).await?;

                        let mut data = async_graphql::Data::default();
                        data.insert(user);
                        Ok(data)
                    // })
                };

                let connection = async_graphql::http::WebSocket::with_data(
                    schema,
                    message_stream,
                    initializer,
                    async_graphql::http::WebSocketProtocols::GraphQLWS,
                )
                    .map(|msg| msg.into_bytes());

                Ok(connection)
            }
        },
    );

    let res = select! {
        res = auth_pem_keys_watcher.fuse() => res,
        res = signalling_future.fuse() => res,
    };

    res?;
    Ok(())
}
