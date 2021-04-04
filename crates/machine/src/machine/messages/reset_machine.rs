use std::os::unix::fs::PermissionsExt;
use pidfile_rs::{
    Pidfile,
    PidfileError,
};
// use teg_protobufs::{
//     ServerMessage,
//     server_message,
// };
use eyre::{
    eyre,
    // Result,
    // Context as _,
};

use crate::machine::Machine;
use crate::config::MachineConfig;

#[xactor::message(result = "()")]
pub struct ResetMachine;

// impl From<ResetMachine> for ServerMessage {
//     fn from(_msg: ResetMachine) -> ServerMessage {
//         ServerMessage {
//             payload: Some(
//                 server_message::Payload::Reset(
//                     server_message::Reset {}
//                 )
//             ),
//         }
//     }
// }

#[async_trait::async_trait]
impl xactor::Handler<ResetMachine> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, _msg: ResetMachine) -> () {
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
                &pid_file.into(),
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
                Ok(_) if attempted_sig_int => {
                    // The drive process was killed successfully. Return so that the actor can
                    // connect to the new socket.
                    return;
                }
                Ok(_) => {
                    // We were able to lock the pidfile without shutting down a driver. This was
                    // not expected.
                    //
                    // It's possible we're in a weird state so lets restart the actor just to be
                    // safe.
                    ctx.stop(Some(eyre!("resetting actor for machine ID: {}", self.id)));
                    return;
                }
                _ => {
                    // Other weirdness - let's try again in a little bit
                }
            };

            async_std::task::sleep(std::time::Duration::from_millis(50)).await;
        }

        ctx.stop(Some(eyre!("Unable to reset machine ID: {}. Restarting actor.", self.id)));
    }
}
