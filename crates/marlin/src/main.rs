extern crate teg_marlin;

use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut args = env::args();
    let tty_path = args.nth(1);

    teg_marlin::start(tty_path).await?;

    Ok(())
}
