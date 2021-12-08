use std::{env, path::PathBuf, str::FromStr};
// use async_std::{fs::{self, File}, io::prelude::WriteExt, path::Path};
// use nix::unistd::setuid;
use sqlx::{PgPool, migrate::MigrateDatabase, postgres::{PgConnectOptions, PgPoolOptions}};
use eyre::{Context, Result};
// // use pg_embed::postgres::{PgEmbed, PgSettings};
// // use pg_embed::pg_enums::PgAuthMethod;
// // use pg_embed::pg_fetch::{PgFetchSettings, PG_V13};
// use std::time::Duration;
// use std::path::PathBuf;

// use teg_auth::AuthContext;
// use teg_device::DeviceManager;
// use teg_machine::{MachineHooksList, MachineMap, MachineMapLocal, MachineMaterialHooks, machine::Machine, signalling_updater::{SignallingUpdater, SignallingUpdaterMachineHooks}};
// use teg_material::{MaterialHooksList};
// use teg_print_queue::print_queue_machine_hooks::PrintQueueMachineHooks;

// async fn start_pg_embed_db(start_pg: bool) -> Result<(Option<PgEmbed>, String)> {
//     let db_name = env::var("DATABASE_NAME")
//         .unwrap_or("teg".to_owned());

//     let port = 15432;

//     let password_path = Path::new("/etc/teg/db-key");
//     let password_len = 80;

//     let password = if password_path.exists().await {
//         fs::read_to_string(password_path).await?
//     } else {
//         use rand::{thread_rng, Rng};
//         use rand::distributions::Alphanumeric;

//         let password: String = thread_rng()
//             .sample_iter(&Alphanumeric)
//             .take(password_len)
//             .map(char::from)
//             .collect();

//         let mut f = File::create(password_path).await?;
//         // Set file permissions
//         f
//             .metadata()
//             .await?
//             .permissions()
//             .set_mode(0o600);
//         // Write the password to the file
//         f.write_all(password.as_bytes()).await?;

//         password
//     };

//     if password.len() != password_len {
//         return Err(eyre!("Password file appears to be corrupted. Please delete it and reboot."));
//     }

//     if !start_pg {
//         return Ok((
//             None,
//             format!("postgres://postgres:{}@localhost:{}/{}", password, port, db_name).to_string()
//         ));
//     }

//     let is_dev = env::var("RUST_ENV")
//         .map(|v| &v == "development")
//         .unwrap_or(true);

//     // Switch to the snap_daemon user when running as the production snap
//     let snap_daemon_uid = if !is_dev {
//         Some(nix::unistd::User::from_name("snap_daemon").unwrap().unwrap().uid.as_raw())
//     } else {
//         Some(nix::unistd::User::from_name("postgres").unwrap().unwrap().uid.as_raw())
//         // None
//         // setuid(snap_daemon_uid).unwrap();
//     };

//     // Postgresql settings
//     let pg_settings = PgSettings{
//         // Where to store the postgresql database
//         database_dir: PathBuf::from("data/db"),
//         port,
//         user: "postgres".to_string(),
//         uid: snap_daemon_uid,
//         // password: "password".to_string(),
//         password,
//         // authentication method
//         auth_method: PgAuthMethod::MD5,
//         // If persistent is false clean up files and directories on drop, otherwise keep them
//         persistent: true,
//         // duration to wait before terminating process execution
//         // pg_ctl start/stop and initdb timeout
//         // if set to None the process will not be terminated
//         timeout: Some(Duration::from_secs(15)),
//         // If migration sql scripts need to be run, the directory containing those scripts can be
//         // specified here with `Some(PathBuf(path_to_dir)), otherwise `None` to run no migrations.
//         // To enable migrations view the **Usage** section for details
//         migration_dir: None,
//     };

//     // Postgresql binaries download settings
//     let fetch_settings = PgFetchSettings{
//         version: PG_V13,
//         ..Default::default()
//     };

//     // Create a new instance
//     let mut pg = PgEmbed::new(pg_settings, fetch_settings).await
//         .expect("Failed to initiate pg embed");

//     // Download, unpack, create password file and database cluster
//     pg.setup().await.expect("Failed to setup teg database");

//     // start postgresql database
//     pg.start_db().await.expect("Failed to sart teg database");

//     // get a postgresql database uri
//     // `postgres://{username}:{password}@localhost:{port}/{specified_database_name}`
//     let embedded_db_uri: String = pg.full_db_uri(&db_name);

//     println!("Running embedded Postgers DB at: {:?}", embedded_db_uri);

//     Ok((Some(pg), embedded_db_uri))
// }

pub async fn create_db(_start_pg: bool) -> Result<(Option<i32>, PgPool)> {
    // Create the database
    // let pg_embed = env::var("PG_EMBED").unwrap_or("0".to_owned()) == "1";

    let pg_embed = None;
    // let (
    //     pg_embed,
    //     db_url,
    // ) = if pg_embed
    // {
    //     // Connect to an embedded PG Database
    //     debug!("Using embedded postgres database");
    //     start_pg_embed_db(start_pg).await?
    // } else {
        // Connect to an external PG Database
        debug!("Using external postgres database");
        let db_url = env::var("DATABASE_URL")
            // .map(|db_url| (None, db_url))
            .wrap_err("DATABASE_URL not set")?;
    // };

    if !sqlx::Postgres::database_exists(&db_url).await
        .wrap_err(format!("Failed to connect to teg postgres server: {:?}", db_url))?
    {
        sqlx::Postgres::create_database(&db_url).await
            .wrap_err("Failed to create teg database")?;
    }

    // Connect to the database
    let db_options = db_url.parse::<PgConnectOptions>()?;

    let db = PgPoolOptions::new()
        // .max_connections(20)
        // SQL querires are normally expected to complete within 100ms. 5 seconds should be a long
        // enough timeout for our useage.
        .connect_timeout(std::time::Duration::from_secs(5))
        .connect_with(db_options)
        .await
        .wrap_err("Failed to connect to initialized teg database")?;

    // Migrate the database
    let migrations = if env::var("RUST_ENV") == Ok("production".to_string()) {
        // Productions migrations dir
        crate::paths::etc().join("migrations")
    } else {
        // Development migrations dir
        let crate_dir = std::env::var("CARGO_MANIFEST_DIR")?;
        PathBuf::from_str(&crate_dir)?.join("migrations")
    };

    info!("Running migrations: {:?}", migrations);

    sqlx::migrate::Migrator::new(migrations)
        .await?
        .run(&db)
        .await?;

    Ok((pg_embed, db))
}
