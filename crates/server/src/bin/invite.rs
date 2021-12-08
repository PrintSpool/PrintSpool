#[macro_use] extern crate tracing;

use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use std::sync::Arc;
use teg_auth::invite::Invite;

#[path = "../create_db.rs"]
mod create_db;
use create_db::create_db;

fn main() -> Result<()> {
    async_std::task::block_on(invite())
}

async fn invite() -> Result<()> {
    // Load dot env from teg's etc directory in production
    if std::env::var("RUST_ENV") != Ok("development".into()) {
        std::env::set_current_dir(crate::paths::etc())?;
    }

    dotenv::dotenv().ok();
    tracing_subscriber::fmt::init();
    color_eyre::install()?;

    let (_pg_embed, db) = create_db(false).await?;
    let server_keys = Arc::new(teg_auth::ServerKeys::load_or_create().await?);

    Invite::generate_and_display(&db, &server_keys, true).await?;

    Ok(())
}
