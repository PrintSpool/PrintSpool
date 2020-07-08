// extern crate teg_auth;
use anyhow::{Result};
use teg_auth::{
  init,
  models::{
    Invite,
  },
};

#[async_std::main]
async fn main() -> Result<()> {
  println!("hello world");

  let context = init().await?;

  let _ = Invite::generate_and_display(&context.db, true).await;

  Ok(())
}
