// #![type_length_limit="15941749"]
#[macro_use] extern crate tracing;
// #[macro_use] extern crate derive_new;

#[cfg(not(target_env = "msvc"))]
use jemallocator::Jemalloc;
use tracing::Instrument;

#[cfg(not(target_env = "msvc"))]
#[global_allocator]
static ALLOC: Jemalloc = Jemalloc;

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
use futures_util::{TryFutureExt, future, future::FutureExt, future::join_all, select, stream::{
        // Stream,
        StreamExt,
        // TryStreamExt,
    }};
use teg_auth::AuthContext;
use teg_device::DeviceManager;
use teg_machine::{MachineHooksList, MachineMap, MachineMapLocal, machine::Machine};
use teg_print_queue::print_queue_machine_hooks::PrintQueueMachineHooks;

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

async fn update_db(_db: &crate::Db) -> Result<()> {
    // // Database migrations
    // sqlx::migrate::Migrator::new(
    //     std::path::Path::new("./migrations")
    // )
    //     .await?
    //     .run(&db)
    //     .await?;
    Ok(())
}

async fn app() -> Result<()> {
    if env::var("RUST_ENV") != Ok("PRODUCTION".to_string()) {
        dotenv::dotenv()
            .wrap_err(".env file not found or failed to load")?;
    }

    tracing_subscriber::fmt::init();
    color_eyre::install()?;

    // Memory useage profiling
    async_std::task::spawn(async {
        use jemalloc_ctl::{stats, epoch};

        loop {
            // many statistics are cached and only updated when the epoch is advanced.
            epoch::advance().unwrap();

            let allocated = stats::allocated::read().unwrap() as f32;
            let resident = stats::resident::read().unwrap() as f32;
            debug!(
                "{:.1} MB allocated / {:.1} MB resident",
                allocated / 1_000_000.0,
                resident / 1_000_000.0,
            );
            async_std::task::sleep(std::time::Duration::from_secs(10)).await;
        }
    }.instrument(tracing::info_span!("memory_useage")));

    let db_url = env::var("DATABASE_URL")
        .wrap_err("DATABASE_URL not set")?;

    let db = SqlitePool::connect(&db_url).await?;

    update_db(&db).await?;

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

    let machine_hooks: MachineHooksList = Arc::new(vec![
        Box::new(PrintQueueMachineHooks),
    ]);

    let machines = machine_ids
        .into_iter()
        .map(|machine_id| {
            let db = db.clone();
            let hooks = machine_hooks.clone();
            async move {
                let machine = Machine::start(
                    db,
                    hooks,
                    &machine_id,
                ).await?;
                let id: async_graphql::ID = machine_id.into();

                Result::<_>::Ok((id, machine))
            }
        });

    let machines: MachineMapLocal = join_all(machines)
        .await
        .into_iter()
        .collect::<Result<_>>()?;

    let machines: MachineMap = Arc::new(ArcSwap::new(Arc::new(machines)));

    let server_keys = Arc::new(teg_auth::ServerKeys::load_or_create().await?);

    let device_manager = DeviceManager::start().await?;

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
            .data(machine_hooks.clone())
            .data(server_keys_clone.clone())
            .data(device_manager.clone())
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

                let root_span = span!(
                    parent: None,
                    tracing::Level::INFO,
                    "span root"
                );
                data.insert(
                    async_graphql::extensions::TracingConfig::default().parent_span(root_span),
                );

                Ok(data)
            }
                .map_err(|err: eyre::Report| {
                    warn!("websocket auth error: {:?}", err);
                    eyre!("Internal Server Error").into()
                });

            let connection = async_graphql::http::WebSocket::with_data(
                schema,
                message_stream,
                initializer,
                async_graphql::http::WebSocketProtocols::GraphQLWS,
            )
                .take_while(|msg| {
                    use async_graphql::http::WsMessage;
                    match msg {
                        WsMessage::Text(_) => {
                            future::ready(true)
                        }
                        WsMessage::Close(_code, msg) => {
                            warn!("WS closed with message: {}", msg);
                            future::ready(false)
                        }
                    }
                })
                .filter_map(|msg| {
                    use async_graphql::http::WsMessage;
                    match msg {
                        WsMessage::Text(msg) => {
                            future::ready(Some(msg.into_bytes()))
                        }
                        WsMessage::Close(_code, _msg) => {
                            future::ready(None)
                        }
                    }
                });

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
