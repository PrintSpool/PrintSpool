// #![type_length_limit="15941749"]
#[macro_use] extern crate tracing;
// #[macro_use] extern crate derive_new;
#[macro_use] extern crate nanoid;

use async_graphql::{UploadValue};
use async_graphql::http::ClientMessage;
use tracing::Instrument;

pub use teg_machine::paths;

use printspool_server::mutation;
use printspool_server::query;
use printspool_server::local_http_server;

use printspool_server::health_check_socket;

use printspool_server::create_db;

use tracing_subscriber::prelude::*;
use std::{sync::Arc};
use serde::Deserialize;
use arc_swap::ArcSwap;
use eyre::{Context, Result, eyre};
use signal_hook::{iterator::Signals, consts::signal::SIGUSR2};
use futures_util::{TryFutureExt, future, future::FutureExt, future::join_all, select, stream::{
    // Stream,
    StreamExt,
    // TryStreamExt,
}};

use printspool_server::teg_auth::AuthContext;
use printspool_server::teg_device::DeviceManager;
use printspool_server::teg_machine::{MachineHooksList, MachineMap, MachineMapLocal, MachineMaterialHooks, machine::Machine, signalling_updater::{SignallingUpdater, SignallingUpdaterMachineHooks}};
use printspool_server::teg_material::{MaterialHooksList};
use printspool_server::teg_print_queue::print_queue_machine_hooks::PrintQueueMachineHooks;

use printspool_server::DbId;

#[derive(Deserialize)]
struct IdFromConfig {
    id: crate::DbId,
}

fn main() -> std::result::Result<(), ()> {
    server().map_err(|err| println!("{:?}", err))
}

fn server() -> Result<()> {
    use nix::sched::{CpuSet, sched_setaffinity};
    use nix::unistd::Pid;

    // Attempt to lock the pidfile
    use std::os::unix::fs::PermissionsExt;
    use pidfile_rs::{
        Pidfile,
    };

    dotenv::dotenv()
        .wrap_err(".env file not found or failed to load")?;

    let pid_file_path = paths::pid_file("server");

    // This pid file is not used for locking - it only exists to give the health monitor a PID
    // to kill in case the server becomes non-responsive.
    let _ = std::fs::remove_file(&pid_file_path);
    let pid_file = Pidfile::new(
        &pid_file_path,
        std::fs::Permissions::from_mode(0o600),
    ).context(format!("Unable to open pid file: {:?}", pid_file_path))?;

    pid_file.write()?;

    // Get the number of CPUs
    let logical_cpus = num_cpus::get();

    // Restrict the server to any logical CPU except for the one that is reserved for
    // the printer driver processes (eg. printspool-marlin).
    let mut cpu_set = CpuSet::new();
    for cpu_index in 1..logical_cpus {
        cpu_set.set(cpu_index)?;
    }
    sched_setaffinity(Pid::from_raw(0), &cpu_set)?;

    // use tracing_error::ErrorLayer;
    // use tracing_subscriber::{prelude::*, registry::Registry};

    // Registry::default().with(ErrorLayer::default()).init();
    // tracing_subscriber::fmt::init();
    tracing_subscriber::Registry::default()
        // any number of other subscriber layers may be added before or
        // after the `ErrorLayer`...
        .with(tracing_error::ErrorLayer::default())
        .with(tracing_subscriber::EnvFilter::try_from_default_env()?)
        .with(tracing_subscriber::fmt::layer())
        .init();

    color_eyre::install()?;

    // Run one async-std thread for each logical CPU except for the one that is reserved for
    // the printer driver processes (eg. printspool-marlin).
    let threads = std::cmp::max(logical_cpus.saturating_sub(1), 1);
    std::env::set_var("ASYNC_STD_THREAD_COUNT", threads.to_string());

    teg_machine::initialize_statics();

    // Start the runtime
    async_std::task::block_on(app())
}

async fn app() -> Result<()> {
    info!("Starting Print Spool");

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

    // Wipe the tmp directory. This is used to store file uploads before they are linked to a more
    // perminent location in the file system.
    let tmp_dir = crate::paths::var().join("tmp");

    let _ = std::fs::remove_dir(&tmp_dir);
    std::fs::create_dir_all(&tmp_dir)
        .wrap_err(
            format!("failed to create tmp directory - check permissions on {:?}", tmp_dir)
        )?;

    // Spawn the health check socket
    async_std::task::spawn(
        health_check_socket().instrument(
            tracing::info_span!("health_check_socket")
        )
    );

    let fresh_install_flag = paths::etc_common().join(".is-fresh-install");
    if fresh_install_flag.exists() {
        // Setup Postgres users on first run
        info!("Fresh Install Detected: Setting up Postgres...");
        let setup_postgres = include_str!("../../../../scripts/setup-postgres");
        std::process::Command::new("sh")
            .arg("-c")
            .arg(setup_postgres)
            .output()
            .expect("setup postgres users");

        std::fs::remove_file(fresh_install_flag).expect("delete .is-fresh-install");
        info!("Fresh Install Detected: Setting up Postgres... [DONE]");
    }

    let is_raspi = rppal::system::DeviceInfo::new().is_ok();
    let wifi_ap_flag = paths::etc_common().join(".enable-wifi-ap");
    let has_wifi_connect = std::process::Command::new("wifi-connect")
        .arg("-V")
        .output()
        .is_ok();

    let mut wifi_enable_pin = None;

    if std::env::var("MANAGE_WIFI_AP") == Ok("1".to_string()) && is_raspi && has_wifi_connect {
        if wifi_ap_flag.exists() {
            // Setup Postgres users on first run
            info!("Enabling Wifi Access Point (Wifi Config Captive Portal)...");
            async_std::task::spawn(async {
                let _ = async_std::process::Command::new("sh")
                    .arg("-c")
                    .arg(r#"
                        # Disable power management of wlan0 to fix network manager
                        # https://github.com/balena-os/wifi-connect/issues/366#issuecomment-744141171
                        iwconfig wlan0 power off

                        wifi-connect -s "PrintSpool 3D Printer"
                    "#)
                    .status()
                    .await;

                async_std::fs::remove_file(wifi_ap_flag)
                    .await
                    .expect("delete .enable-wifi-ap");

                info!("Wifi configuration complete! Print Spool should now be connected to your wifi.");
                // Restart the server
                std::process::exit(0);
            });
        } else {
            info!(
                "Wifi access point can be enabled by connecting 3.3V to GPIO15 (Physical Pin 10)"
            );
            // if the wifi ap flag doesn't exist on startup then listen on GPIO to reset
            // `.enable-wifi-ap` when the user connects the 3.3v pin to GPIO 15.
            use rppal::gpio::{ Gpio, Trigger, Level };

            let gpio = Gpio::new()?;
            // Gpio uses BCM pin numbering. BCM GPIO 15 is tied to physical pin 10.
            // See: https://pinout.xyz/pinout/pin10_gpio15#
            // Also: https://raspberrypihq.com/use-a-push-button-with-raspberry-pi-gpio/
            let mut pin = gpio.get(15)?.into_input_pulldown();

            let wifi_ap_flag = wifi_ap_flag.clone();
            pin.set_async_interrupt(Trigger::RisingEdge, move |level| {
                info!("Interrupt triggered on Wifi AP pin. Level: {:?}", level);
                if level != Level::High {
                    return
                }

                std::fs::write(wifi_ap_flag.clone(), "")
                    .expect("set .enable-wifi-ap flag");
                // Restart the server
                std::process::exit(0);
            })
                .expect("set wifi AP GPIO interrupt");

            wifi_enable_pin = Some(pin);
        }
    } else {
        info!(r#"
            Not running on a raspberry pi with wifi-connect or MANAGE_WIFI_AP is not set to "1".\
            Wifi access point disabled.
        "#)
    }


    let (_pg_embed, db) = create_db(true).await?;

    let machine_ids: Vec<crate::DbId> = std::fs::read_dir(crate::paths::etc_common())?
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
                    crate::paths::etc_common().join(&file_name)
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
        Box::new(PrintQueueMachineHooks {
            db: db.clone(),
        }),
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
            info!("Client connected");
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

    drop(wifi_enable_pin);

    res?;
    Ok(())
}
