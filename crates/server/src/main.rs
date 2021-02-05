// #![type_length_limit="15941749"]
#[macro_use] extern crate tracing;
// #[macro_use] extern crate derive_new;

// The file `built.rs` was placed there by cargo and `build.rs`
#[allow(dead_code)]
mod built_info {
    include!(concat!(env!("OUT_DIR"), "/built.rs"));
}

mod mutation;
mod query;
mod server_query;
mod local_http_server;

use std::{env, sync::Arc};
use serde::Deserialize;
use sqlx::SqlitePool;
use arc_swap::ArcSwap;
use eyre::{Context, Result, eyre};
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
use teg_auth::AuthContext;
use teg_machine::{MachineMap, MachineMapLocal, machine::Machine};

const CONFIG_DIR: &'static str = "/etc/teg/";

pub type Db = sqlx::sqlite::SqlitePool;
pub type DbId = teg_json_store::DbId;

type AppSchemaBuilder = async_graphql::SchemaBuilder<
    query::Query,
    mutation::Mutation,
    async_graphql::EmptySubscription
>;

type AppSchema = async_graphql::Schema<
    query::Query,
    mutation::Mutation,
    async_graphql::EmptySubscription
>;

#[derive(Deserialize)]
struct IdFromConfig {
    id: crate::DbId,
}

fn main() -> Result<()> {
    async_std::task::block_on(app())
}

async fn app() -> Result<()> {
    dotenv::dotenv().ok();
    tracing_subscriber::fmt::init();
    color_eyre::install()?;

    let db = SqlitePool::connect(&env::var("DATABASE_URL")?).await?;

    // // Database migrations
    // sqlx::migrate::Migrator::new(
    //     std::path::Path::new("./migrations")
    // )
    //     .await?
    //     .run(&db)
    //     .await?;

    let machine_ids: Vec<crate::DbId> = std::fs::read_dir(CONFIG_DIR)?
        .map(|entry| {
            let entry = entry?;
            let file_name = entry.file_name().to_str()
                .ok_or_else(|| eyre!("Invalid file name in config dir"))?
                .to_string();

            if
                entry.file_type()?.is_file()
                && file_name.starts_with("machine-")
                && file_name.ends_with(".toml")
            {
                let config_file = std::fs::read_to_string(
                    format!("{}{}", CONFIG_DIR, file_name)
                )
                    .wrap_err(format!("Unable to read machine config file: {}", file_name))?;

                let IdFromConfig {
                    id,
                    ..
                } = toml::from_str(&config_file)
                    .wrap_err(format!("Bad machine config file: {}", file_name))?;

                if !file_name.ends_with(&format!("machine-{}.toml", id)) {
                    Err(eyre!(
                        "Machine ID in config file ({}) does not match up with filename: {}",
                        id,
                        file_name,
                    ))?;
                }
                Ok(Some(id))
            } else {
                Ok(None)
            }
        })
        .filter_map(|result| result.transpose())
        .collect::<Result<_>>()?;

    let machines = machine_ids
        .into_iter()
        .map(|machine_id| {
            let db = db.clone();
            async move {
                let machine = Machine::start(db, &machine_id).await?;
                let id: async_graphql::ID = machine_id.into();

                Result::<_>::Ok((id, machine))
            }
        });

    let machines: MachineMapLocal = join_all(machines)
        .await
        .into_iter()
        .collect::<Result<_>>()?;

    let machines: MachineMap = Arc::new(ArcSwap::new(Arc::new(machines)));

    // let (
    //     auth_pem_keys,
    //     auth_pem_keys_watcher,
    // ) = watch_pem_keys().await?;

    let server_keys = Arc::new(teg_auth::ServerKeys::load_or_create().await?);

    // Build the server
    let db_clone = db.clone();
    let machines_clone = machines.clone();
    let server_keys_clone = server_keys.clone();

    let schema_builder = || {
            async_graphql::Schema::build(
            query::Query::default(),
            mutation::Mutation::default(),
            async_graphql::EmptySubscription,
        )
            .extension(async_graphql::extensions::Tracing::default())
            .data(db_clone.clone())
            .data(machines_clone.clone())
            .data(server_keys_clone.clone())
    };

    let schema = schema_builder().finish();

    let schema_clone = schema.clone();
    let db_clone = db.clone();

    let signalling_future = teg_data_channel::listen_for_signalling(
        &server_keys,
        &machines,
        move |signal, message_stream| {
            info!("Data channel connected");
            let schema = schema_clone.clone();
            let db = db_clone.clone();
            // let auth_pem_keys = auth_pem_keys.clone();
            let initializer = |_| async move {
                let user = teg_auth::user::User::authenticate(
                    &db,
                    signal,
                ).await?;

                let auth_context = AuthContext::new(
                    user,
                );

                let mut data = async_graphql::Data::default();

                data.insert(auth_context);

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

    let http_server = local_http_server::start(
        &db,
        schema_builder(),
    );

    let res = select! {
        // res = auth_pem_keys_watcher.fuse() => res,
        res = signalling_future.fuse() => res,
        res = http_server.fuse() => res,
    };

    res?;
    Ok(())
}
