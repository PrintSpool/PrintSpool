use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use std::sync::Arc;
use printspool_server::printspool_auth::invite::Invite;

use printspool_server::paths;

use printspool_server::create_db;

fn main() -> Result<()> {
    async_std::task::block_on(invite())
}

async fn invite() -> Result<()> {
    // Load dot env from teg's etc directory in production
    if
        // Default to development when running inside a cargo command
        std::env::var("CARGO_MANIFEST_DIR").is_err()
        // Default to production when running as a distributed binary (ie. outside of cargo)
        && std::env::var("RUST_ENV") != Ok("development".into())
    {
        let etc = crate::paths::etc();
        std::env::set_current_dir(&etc)
            .expect(&format!("Set current directory to {:?}", &etc));
    }

    dotenv::dotenv().ok();
    tracing_subscriber::fmt::init();
    color_eyre::install()?;

    let (_pg_embed, db) = create_db(false)
        .await
        .expect("Connect to database");

    let server_keys = printspool_server::printspool_auth::ServerKeys::load_or_create()
        .await
        .expect("load/create server keys");
    let server_keys = Arc::new(server_keys);

    Invite::generate_and_display(&db, &server_keys, true)
        .await
        .expect("Generate and display invite");

    Ok(())
}
