// #![feature(proc_macro)]
extern crate proc_macro;
// #[macro_use] extern crate async_std;
#[macro_use] extern crate tracing;
// #[macro_use] extern crate log_derive;
#[macro_use] extern crate derive_new;

extern crate secp256k1;
extern crate rand;
extern crate rmp_serde as rmps;
extern crate serde;
extern crate url;
extern crate gravatar;

use dotenv::dotenv;
use std::env;
use std::sync::Arc;
use arc_swap::ArcSwap;
use async_std::task;
use eyre::{
    eyre,
    Context as _,
    Result,
};

pub mod models;
pub mod materials;
mod context;
mod graphql_schema;
pub mod configuration;
pub mod backup;

pub mod print_queue;
pub mod machine;
pub use machine::models::{
    Machine,
    MachineStatus,
};
pub use models::VersionedModel as _;

pub use context::Context;
pub use graphql_schema::{ Query, Mutation };

fn read_config(config_path: &str) -> Result<configuration::Config> {
    let config_file_content = std::fs::read_to_string(config_path.clone())
        .with_context(|| format!("Unabled to read machine config (file: {:?})", config_path))?;

    let config: configuration::Config = toml::from_str(&config_file_content)
        .with_context(|| format!("Invalid machine config format (file: {:?})", config_path))?;

    Ok(config)
}

// Firebase Certs
pub async fn watch_auth_pem_keys(
) -> Result<(ArcSwap<Vec<Vec<u8>>>, impl futures::Future<Output = Result<()>>)> {
    let pem_keys = async {
        // Retry until the PEM keys are downloaded successfully
        loop {
            match models::jwt::get_pem_keys().await {
                Ok(pem_keys) => return pem_keys,
                Err(err) => warn!("{:?}", err),
            };
            task::sleep(std::time::Duration::from_millis(500)).await;
        };
    }.await;
    let pem_keys = ArcSwap::new(Arc::new(pem_keys));

    let pem_keys_clone = pem_keys.clone();
    let refresh_task = async move {
        loop {
            info!("Firebase certs will refresh in an hour");
            task::sleep(std::time::Duration::from_secs(60 * 60)).await;

            let next_pem_keys = models::jwt::get_pem_keys()
                .await
                .with_context(|| "Unable to refresh Firebase certs")?;

            pem_keys_clone.store(Arc::new(next_pem_keys));
        }
    };

    Ok((pem_keys, refresh_task))
}

pub async fn init() -> Result<Context> {
    dotenv().ok();


    // Trace executed code
    // use tracing_subscriber::layer::SubscriberExt;
    // use tracing_subscriber::Registry;

    tracing_subscriber::fmt::init();

    // Journald
    // let journald_subscriber = Registry::default().with(tracing_journald::layer()?);
    // tracing::subscriber::set_global_default(journald_subscriber)?;

    // Tracing Tree
    // let subscriber = Registry::default().with(tracing_tree::HierarchicalLayer::new(2));
    // tracing::subscriber::set_global_default(subscriber).expect("Failed to start tracing");

    // Custom Fmt
    // let tracing_builder = tracing_subscriber::fmt::Subscriber::builder();
    // let tracing_builder = tracing_builder
    //     // .with_span_list(true)
    //     .with_env_filter(tracing_subscriber::EnvFilter::from_default_env());
    // tracing_builder.try_init().expect("Failed to start tracing");

    let db_file = env::var("SLED_DB_PATH")
        .expect("$SLED_DB_PATH not set");

    let config = sled::Config::default()
        .path(db_file.clone())
        .cache_capacity(10_000_000);

    let db = config.open()
        .map(|db| Arc::new(db))
        .with_context(|| format!("Unable to open sled database: {}", db_file))?;

    models::Invite::generate_or_display_initial_invite(&db)
        .await
        .map_err(|err| {
            eyre!("{:?}", err)
        })?;

    // Config
    // ----------------------------------------------------
    let config_path = env::var("MACHINE_CONFIG");
    let config_path = config_path.unwrap_or("/etc/teg/machine.toml".to_string());

    let config = read_config(&config_path).unwrap();
    let config = Arc::new(ArcSwap::new(Arc::new(
        config,
    )));

    // Initialize database entries from the config
    let machine_config_id = config.load().id.clone();
    if Machine::find_opt(&db, |m| m.config_id == machine_config_id)?.is_none() {
        let machine = Machine::new(
            Machine::generate_id(&db)?,
            machine_config_id,
        );
        let _ = machine.insert(&db)?;
    };

    // Watch the config file for changes
    let config_clone = Arc::clone(&config);
    let config_path_clone = config_path.clone();
    std::thread::spawn(move || {
        use notify::{Watcher, RecursiveMode, watcher, DebouncedEvent};
        use std::sync::mpsc::channel;
        use std::time::Duration;

        let mut config_dir = std::path::PathBuf::from(&config_path_clone);
        config_dir.pop();
        let config_dir = config_dir.to_str()
            .expect("Unable to set config directory");

        // Create a channel to receive the events.
        let (tx, rx) = channel();

        // Create a watcher object, delivering debounced events.
        // The notification back-end is selected based on the platform.
        let mut watcher = watcher(tx, Duration::from_millis(100))
            .expect("Unable to initialize config watcher");

        watcher.watch(&config_dir, RecursiveMode::NonRecursive)
            .expect("Unable to watch config file");

        loop {
            match rx.recv() {
                | Ok(DebouncedEvent::Create(file_path))
                | Ok(DebouncedEvent::Write(file_path)) => {
                    if file_path.to_str() == Some(&config_path_clone) {
                        info!("Config file changed");

                        let next_config = read_config(&config_path_clone).unwrap();

                        config_clone.store(Arc::new(next_config));

                        info!("Config changes applied");
                    }
                },
                Err(e) => println!("watch error: {:?}", e),
                _ => (),
            }
        }
    });

    info!("Watching for config changes at: {}", &config_path);

    Ok(Context {
        db,
        current_user: None,
        session_id: None,
        identity_public_key: None,
        auth_pem_keys: ArcSwap::new(Arc::new(vec![vec![]])),
        machine_config: config,
        ephemeral_machine_data: std::collections::HashMap::new(),
    })
}
