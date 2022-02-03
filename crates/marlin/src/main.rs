extern crate teg_marlin;

use std::env;
use std::os::unix::fs::PermissionsExt;
use pidfile_rs::Pidfile;
use nix::sched::{CpuSet, sched_setaffinity};
use nix::unistd::Pid;

use teg_marlin::MachineConfig;

pub use teg_machine::paths;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut args = env::args();
    let machine_id = args.nth(1)
        .expect("Expected useage: tegh.marlin $MACHINE_ID");

    let pid_file = MachineConfig::pid_file_path(&machine_id);
    let config_path = MachineConfig::config_file_path(&machine_id);

    // Create and lock the pidfile
    // See: https://yakking.branchable.com/posts/procrun-2-pidfiles/
    let pidfile = Pidfile::new(
        &pid_file,
        std::fs::Permissions::from_mode(0o600),
    )?;

    // Must run daemonize before starting tokio!
    nix::unistd::daemon(true, true)
        .expect("Error daemonizing marlin driver process");

    // After daemonizing the process write the pid to the pidfile
    pidfile.write()?;

    // All other teg processes are prevented from running on cpu 0 so that it can be dedicated
    // to the driver processes (eg. printspool-marlin).
    let mut cpu_set = CpuSet::new();
    cpu_set.set(0)?;
    sched_setaffinity(Pid::from_raw(0), &cpu_set)?;

    // Create single-threaded runtime that will run printspool-marlin only on the dedicated CPU
    let rt = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?;

    rt.block_on(teg_marlin::start(config_path))?;

    Ok(())
}
