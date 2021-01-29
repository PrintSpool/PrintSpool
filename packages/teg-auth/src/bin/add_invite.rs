// #[macro_use] extern crate tracing;
use eyre::{Result};
use teg_auth::{
  init,
  models::{
    Invite,
  },
};

fn main() -> Result<()> {
  async_std::task::block_on(app())
}

async fn app() -> Result<()> {
  let context = init().await?;

  let _ = Invite::generate_and_display(&context.db, true).await;

  Ok(())
}
