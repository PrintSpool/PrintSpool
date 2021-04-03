extern crate teg_marlin;

use std::env;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut args = env::args();
    let config_path = args.nth(1);

    // Must run daemonize before starting tokio!
    if
        std::env::var("RUST_ENV").map(|v| &v == "production")
            .or(std::env::var("DAEMONIZE_MARLIN").map(|v| &v == "1"))
            .unwrap_or(false)

    {
        nix::unistd::daemon(true, true)
            .expect("Error daemonizing marlin driver process");
    }

    let mut rt = tokio::runtime::Runtime::new()?;

    // Spawn the root task
    let pid_file = rt.block_on(teg_marlin::start(config_path))?;

    // Pid file must only be removed once all resources (eg. serial port, socket) have been
    // released - meaning after all the Drop handlers have ran (RAII).
    std::fs::remove_file(pid_file)?;

    Ok(())
}
