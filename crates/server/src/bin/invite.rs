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
    dotenv::dotenv().ok();
    tracing_subscriber::fmt::init();
    color_eyre::install()?;

    let (_pg_embed, db) = create_db(false).await?;
    let server_keys = Arc::new(teg_auth::ServerKeys::load_or_create().await?);

    Invite::generate_and_display(&db, &server_keys, true).await?;

    Ok(())
}
