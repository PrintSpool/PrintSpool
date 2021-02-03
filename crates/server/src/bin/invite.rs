use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use sqlx::SqlitePool;
use std::{env, sync::Arc};
use teg_auth::invite::Invite;

fn main() -> Result<()> {
    async_std::task::block_on(invite())
}

async fn invite() -> Result<()> {
    dotenv::dotenv().ok();
    tracing_subscriber::fmt::init();
    color_eyre::install()?;

    let db = SqlitePool::connect(&env::var("DATABASE_URL")?).await?;
    let server_keys = Arc::new(teg_auth::ServerKeys::load_or_create().await?);

    Invite::generate_and_display(&db, &server_keys, true).await?;

    Ok(())
}
