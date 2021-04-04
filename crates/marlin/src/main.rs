extern crate teg_marlin;

use std::env;
use std::os::unix::fs::PermissionsExt;
use pidfile_rs::Pidfile;

use teg_machine::config::MachineConfig;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut args = env::args();
    let machine_id = args.nth(1)
        .expect("Expected useage: tegh.marlin $MACHINE_ID");

    let pid_file = MachineConfig::pid_file_path(&machine_id);
    let config_path = MachineConfig::config_file_path(&machine_id);

    // Create and lock the pidfile
    // See: https://yakking.branchable.com/posts/procrun-2-pidfiles/
    let pidfile = Pidfile::new(
        &pid_file.into(),
        std::fs::Permissions::from_mode(0o600),
    )?;

    // Must run daemonize before starting tokio!
    // if
    //     std::env::var("RUST_ENV").map(|v| &v == "production")
    //         .or(std::env::var("DAEMONIZE_MARLIN").map(|v| &v == "1"))
    //         .unwrap_or(false)

    // {
    nix::unistd::daemon(true, true)
        .expect("Error daemonizing marlin driver process");
    // }

    // After daemonizing the process write the pid to the pidfile
    pidfile.write()?;

    let mut rt = tokio::runtime::Runtime::new()?;

    // Spawn the root task
    rt.block_on(teg_marlin::start(config_path))?;

    Ok(())
}
