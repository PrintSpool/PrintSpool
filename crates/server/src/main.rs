// #![type_length_limit="15941749"]
#[macro_use] extern crate tracing;
// #[macro_use] extern crate derive_new;
#[macro_use] extern crate nanoid;

use async_graphql::{UploadValue};
use async_graphql::http::ClientMessage;
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
use sqlx::{SqlitePool, migrate::MigrateDatabase, sqlite::{SqliteConnectOptions, SqlitePoolOptions}};
use arc_swap::ArcSwap;
use eyre::{Context, Result, eyre};
use signal_hook::{iterator::Signals, consts::signal::SIGUSR2};
use futures_util::{TryFutureExt, future, future::FutureExt, future::join_all, select, stream::{
    // Stream,
    StreamExt,
    // TryStreamExt,
}};

use teg_auth::AuthContext;
use teg_device::DeviceManager;
use teg_machine::{MachineHooksList, MachineMap, MachineMapLocal, MachineMaterialHooks, machine::Machine, signalling_updater::{SignallingUpdater, SignallingUpdaterMachineHooks}};
use teg_material::{MaterialHooksList};
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
    use nix::sched::{CpuSet, sched_setaffinity};
    use nix::unistd::Pid;

    let logical_cpus = num_cpus::get();

    // Restrict the server to any logical CPU except for the one that is reserved for
    // the printer driver processes (eg. teg-marlin).
    let mut cpu_set = CpuSet::new();
    for cpu_index in 1..logical_cpus {
        cpu_set.set(cpu_index)?;
    }
    sched_setaffinity(Pid::from_raw(0), &cpu_set)?;

    // Run one async-std thread for each logical CPU except for the one that is reserved for
    // the printer driver processes (eg. teg-marlin).
    let threads = std::cmp::max(logical_cpus.saturating_sub(1), 1);
    std::env::set_var("ASYNC_STD_THREAD_COUNT", threads.to_string());

    // Start the runtime
    async_std::task::block_on(app())
}

async fn create_db() -> Result<SqlitePool> {
    use std::path::Path;

    // Create the database
    let db_url = env::var("DATABASE_URL")
        .wrap_err("DATABASE_URL not set")?;

    if !sqlx::Sqlite::database_exists(&db_url).await? {
        sqlx::Sqlite::create_database(&db_url).await?;
    }

    // Connect to the database
    let db_options = db_url.parse::<SqliteConnectOptions>()?
        .synchronous(sqlx::sqlite::SqliteSynchronous::Normal);

    let db = SqlitePoolOptions::new()
        .max_connections(1)
        .connect_with(db_options)
        .await?;

    // Migrate the database
    let migrations = if env::var("RUST_ENV") == Ok("production".to_string()) {
        // Productions migrations dir
        std::env::current_exe()?
            .parent()
            .unwrap()
            .join("migrations")
    } else {
        // Development migrations dir
        let crate_dir = std::env::var("CARGO_MANIFEST_DIR")?;
        Path::new(&crate_dir)
            .join("migrations")
    };

    info!("Running migrations: {:?}", migrations);

    sqlx::migrate::Migrator::new(migrations)
        .await?
        .run(&db)
        .await?;

    Ok(db)
}

async fn app() -> Result<()> {
    teg_machine::initialize_statics();

    if env::var("RUST_ENV") != Ok("production".to_string()) {
        dotenv::dotenv()
            .wrap_err(".env file not found or failed to load")?;
    }

    tracing_subscriber::fmt::init();
    color_eyre::install()?;

    // USR2 Signals handling
    let mut signals = Signals::new(&[SIGUSR2])?;

    std::thread::spawn(move || {
        for sig in signals.forever() {
            println!("Received signal {:?}", sig);
            std::process::exit(0);
        }
    });


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
            async_std::task::sleep(std::time::Duration::from_secs(5 * 60)).await;
        }
    }.instrument(tracing::info_span!("memory_useage")));

    let db = create_db().await?;

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

    let server_keys = Arc::new(teg_auth::ServerKeys::load_or_create().await?);

    let signalling_updater = SignallingUpdater::start(
        db.clone(),
        server_keys.clone(),
    ).await?;
    let device_manager = DeviceManager::start().await?;

    let machine_hooks: MachineHooksList = Arc::new(vec![
        Box::new(PrintQueueMachineHooks),
        Box::new(SignallingUpdaterMachineHooks {
            signalling_updater: signalling_updater.clone(),
            db: db.clone(),
        }),
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

    let material_hooks: MaterialHooksList = Arc::new(vec![
        Box::new(MachineMaterialHooks { machines: machines.clone() }),
    ]);

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
            .extension(async_graphql::extensions::Tracing)
            .extension(async_graphql::extensions::ApolloTracing)
            .data(db_clone.clone())
            .data(server_keys_clone.clone())
            .data(signalling_updater.clone())
            .data(machines_clone.clone())
            .data(machine_hooks.clone())
            .data(material_hooks.clone())
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

                // let root_span = span!(
                //     parent: None,
                //     tracing::Level::INFO,
                //     "span root"
                // );
                // data.insert(
                //     async_graphql::extensions::TracingConfig::default().parent_span(root_span),
                // );

                Ok(data)
            }
                .map_err(|err: eyre::Report| {
                    warn!("websocket auth error: {:?}", err);
                    eyre!("Internal Server Error").into()
                });

            let message_stream = message_stream
                .inspect(|msg| {
                    if msg.files.len() > 0 {
                        info!("GraphQL message received with {} files", msg.files.len());
                    }
                })
                .map(|msg| {
                    let uploads = msg.files
                        .into_iter()
                        .map(|content| UploadValue {
                            filename: "upload".to_string(),
                            content_type: None,
                            content,
                        })
                        .collect();

                    let mut client_message = ClientMessage::from_bytes(msg.payload)?;

                    if let ClientMessage::Start {
                        payload: request,
                        ..
                    } = &mut client_message {
                        request.uploads = uploads;
                    }

                    Ok(client_message)
                });

            let connection = async_graphql::http::WebSocket::with_message_stream(
                schema,
                message_stream,
                initializer,
                async_graphql::http::WebSocketProtocols::GraphQLWS,
            )
                // .take_while(|msg| {
                //     use async_graphql::http::WsMessage;
                //     match msg {
                //         WsMessage::Text(_) => {
                //             future::ready(true)
                //         }
                //         WsMessage::Close(_code, msg) => {
                //             warn!("WS closed with message: {}", msg);
                //             future::ready(false)
                //         }
                //     }
                // })
                .filter_map(|msg| {
                    use async_graphql::http::WsMessage;
                    match msg {
                        WsMessage::Text(msg) => {
                            future::ready(Some(msg.into_bytes()))
                        }
                        WsMessage::Close(_code, msg) => {
                            let rtc_msg = serde_json::json!({
                                "id": nanoid!(),
                                "type": "connection_error",
                                "payload": {
                                    "message": msg,
                                },
                            });

                            future::ready(Some(rtc_msg.to_string().into_bytes()))
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
