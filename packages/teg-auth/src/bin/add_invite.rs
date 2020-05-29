// extern crate teg_auth;
use teg_auth::{
  init,
  models::{
    Invite,
  },
};

#[async_std::main]
async fn main() -> teg_auth::Result<()> {
  println!("hello world");

  let context = init().await?;

  let _ = Invite::generate_and_display(&context.db, true).await;

  Ok(())
}
