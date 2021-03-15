use async_codec::Framed;
use xactor::Actor;
// use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
// use std::sync::Arc;
use async_std::{
    fs,
    os::unix::net::UnixStream,
};
use eyre::{
    // eyre,
    Result,
    // Context as _,
};

use super::{MachineStatus, messages::{ConnectToSocket, ResetMaterialTargets}, streams::receive_stream::codec::MachineCodec};
use super::GCodeHistoryEntry;
use crate::config::MachineConfig;
use crate::components::Toolhead;

/// Actor to synchronize machine CRUD changes with the signalling server's cached list of this
/// host's machines.
pub struct SignallingUpdater {
    pub db: crate::Db,
}

#[async_trait::async_trait]
impl Actor for SignallingUpdater {
    #[instrument(fields(id = &self.id[..]), skip(self, ctx))]
    async fn started(&mut self, ctx: &mut xactor::Context<Self>) -> Result<()> {
        let result = ctx.address().send(Sync);

        if let Err(err) = result {
            warn!("Error starting signalling sync: {:?}", err);
            // Prevent a tight loop of actor restarts from DOSing the server
            async_std::time::sleep(std::time::Duration::from_secs(1)).await;
            ctx.stop(Some(err));
        }

        Ok(())
    }
}

impl SignallingUpdater {
    pub async fn start(
        db: crate::Db,
    ) -> Result<xactor::Addr<SignallingUpdater>> {
        let signalling_sync = xactor::Supervisor::start(move ||
            SignallingUpdater {
                db: db.clone(),
            }
        ).await?;
        Ok(signalling_sync)
    }
}
