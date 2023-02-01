use std::os::unix::fs::PermissionsExt;
use pidfile_rs::{
    Pidfile,
    PidfileError,
};
use eyre::{
    eyre,
    Result,
    // Context as _,
};

use crate::machine::Machine;
use crate::config::MachineConfig;

#[xactor::message(result = "Result<()>")]
pub struct DeleteMachine;

#[async_trait::async_trait]
impl xactor::Handler<DeleteMachine> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, _msg: DeleteMachine) -> Result<()> {
        // Delete the machine foreign keys in the database
        sqlx::query!(
            r#"
                DELETE FROM machine_print_queues
                WHERE machine_id = $1
            "#,
            self.id,
        )
            .fetch_optional(&self.db)
            .await?;

        // Delete the machine config
        let config_path = crate::paths::etc_common().join(format!("machine-{}.toml", self.id));
        let _ = std::fs::remove_file(config_path);

        let mut attempted_sig_int = false;
        let mut attempts = 0;

        loop {
            attempts += 1;
            if attempts >= 10 {
                break
            }

            // Attempt to lock the pidfile
            let pid_file = MachineConfig::pid_file_path(&self.id);

            let lock_result = Pidfile::new(
                &pid_file,
                std::fs::Permissions::from_mode(0o600),
            )
                // Drop the pidfile lock immediately to prevent blocking the driver from starting
                .map(|_| ());

            match lock_result {
               Err(PidfileError::AlreadyRunning { pid: Some(pid) }) => {
                    // The driver process is running (as expected) so lets kill it.
                    let pid = nix::unistd::Pid::from_raw(pid);

                    let kill_signal = if attempted_sig_int {
                        info!("Force killing driver for machine ID: {}", self.id);
                        nix::sys::signal::Signal::SIGKILL
                    } else {
                        info!("Resetting driver for machine ID: {}", self.id);
                        nix::sys::signal::Signal::SIGINT
                    };

                    match nix::sys::signal::kill(pid, kill_signal) {
                        Ok(()) => {
                            attempted_sig_int = true;
                        },
                        Err(err) => {
                            warn!("Error killing driver: {:?}", err);
                        }
                    };
                }
                Ok(_) => {
                    // The drive process was killed successfully.
                    ctx.stop(Some(eyre!("Machine ID: {} deleted", self.id)));
                    return Ok(());
                }
                _ => {
                    // Other weirdness - let's try again in a little bit
                }
            };

            async_std::task::sleep(std::time::Duration::from_millis(10)).await;
        }

        ctx.stop(Some(eyre!("Unable to kill pid for deleted machine ID: {}", self.id)));

        Ok(())
    }
}
