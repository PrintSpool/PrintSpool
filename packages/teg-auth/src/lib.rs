// #[macro_use] extern crate async_std;
#[macro_use] extern crate juniper;
#[macro_use] extern crate log;
// #[macro_use] extern crate log_derive;


// #[macro_use] extern crate log;
// #[macro_use] extern crate graphql_client;
// extern crate tokio;
extern crate reqwest;
extern crate secp256k1;
extern crate rand;
extern crate rmp_serde as rmps;
// extern crate futures;
// extern crate futures03;
extern crate serde;
// extern crate serde_json;
extern crate url;
extern crate gravatar;

use dotenv::dotenv;
use std::env;
use std::sync::Arc;
use async_std::sync::RwLock;

pub mod models;
mod context;
mod graphql_schema;
mod configuration;

pub use context::Context;
pub use graphql_schema::{ Schema, Query, Mutation };

use async_std::task;

error_chain::error_chain! {}

fn read_config(config_path: &str) -> crate::Result<configuration::Config> {
    let config_file_content = std::fs::read_to_string(config_path.clone())
        .chain_err(|| format!("Unabled to open config (file: {:?})", config_path))?;

    let config: configuration::Config = toml::from_str(&config_file_content)
        .chain_err(|| format!("Invalid config format (file: {:?})", config_path))?;

    Ok(config)
}

// Firebase Certs
pub async fn watch_auth_pem_keys() -> crate::Result<Arc<RwLock<Vec<Vec<u8>>>>> {
    let pem_keys = models::jwt::get_pem_keys()?;
    let pem_keys_lock = Arc::new(RwLock::new(pem_keys));

    let pem_keys_refresh = Arc::clone(&pem_keys_lock);

    use futures::stream::StreamExt;

    let firebase_refresh_task = async_std::stream::repeat(())
        .fold(pem_keys_refresh, |pem_keys_refresh, _| async move {
            info!("Firebase certs will refresh in an hour");
            task::sleep(std::time::Duration::from_secs(60 * 60)).await;

            let next_pem_keys = models::jwt::get_pem_keys().expect("Unable to refresh Firebase certs");

            let pem_keys_borrow = Arc::clone(&pem_keys_refresh);
            let mut writer = pem_keys_borrow.write().await;

            *writer = next_pem_keys;

            pem_keys_refresh
        });

    task::spawn(firebase_refresh_task);

    Ok(pem_keys_lock)
}

pub async fn init() -> crate::Result<Context> {
    dotenv().ok();
    env_logger::init();

    // let database_url = env::var("POSTGRESQL_ADDON_URI")
    //     .expect("$POSTGRESQL_ADDON_URI must be set");

    // let pool = sqlx::PgPool::new(&database_url)
    //     .await
    //     .map(|p| Arc::new(p))
    //     .expect("Could not connect to Postgres");

    let db_file = env::var("SLED_DB_PATH")
        .expect("$SLED_DB_PATH not set");

    let config = sled::Config::default()
        .path(db_file.clone())
        .cache_capacity(10_000_000);

    let db = config.open()
        .map(|db| Arc::new(db))
        .chain_err(|| format!("Unable to open sled database: {}", db_file))?;

    models::Invite::generate_or_display_initial_invite(&db)
        .await
        .map_err(|err| {
            format!("{:?}", err)
        })?;

    // Config
    // ----------------------------------------------------
    let config_path = None; // TODO: configurable config_path
    let config_path = config_path.unwrap_or("/etc/teg/machine.toml".to_string());

    let config = read_config(&config_path).unwrap();
    let config = Arc::new(RwLock::new(config));

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

                        let mut writer = async_std::task::block_on(config_clone.write());

                        *writer = next_config;

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
        identity_public_key: None,
        auth_pem_keys: Arc::new(RwLock::new(vec![vec![]])),
        machine_config: config,
    })
}
