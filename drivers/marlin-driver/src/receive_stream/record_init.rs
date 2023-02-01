use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use printspool_protobufs::machine_message::Init;
use crate::machine::{Machine, messages::ResetWhenIdle};

pub async fn record_init(
    machine: &mut Machine,
    driver_init: Init,
    ctx: &mut xactor::Context<Machine>,
) -> Result<()> {
    if crate::PROCESS_STARTED_AT.timestamp_nanos() > driver_init.process_started_at_nanos {
        // reset any driver that predates this server's startup once it is not busy with a print
        info!(
            "Old driver process for machine ID {} will reset when idle.",
            machine.id,
        );
        ctx.address().send(ResetWhenIdle)?;
    } else {
        info!("New driver process started for machine ID {}", machine.id);
    }

    Ok(())
}
