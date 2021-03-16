use std::sync::Arc;
use xactor::Actor;
use eyre::{
    // eyre,
    Result,
    // Context as _,
};

use super::SyncChanges;

/// Actor to synchronize machine CRUD changes with the signalling server's cached list of this
/// host's machines.
pub struct SignallingUpdater {
    pub db: crate::Db,
    pub server_keys: Arc<teg_auth::ServerKeys>,
}

#[async_trait::async_trait]
impl Actor for SignallingUpdater {
    #[instrument(skip(self, ctx))]
    async fn started(&mut self, ctx: &mut xactor::Context<Self>) -> Result<()> {
        let result = ctx.address().send(SyncChanges);

        if let Err(err) = result {
            warn!("Error starting signalling sync: {:?}", err);
            // Prevent a tight loop of actor restarts from DOSing the server
            async_std::task::sleep(std::time::Duration::from_secs(1)).await;
            ctx.stop(Some(err));
        }

        Ok(())
    }
}

impl SignallingUpdater {
    pub async fn start(
        db: crate::Db,
        server_keys: Arc<teg_auth::ServerKeys>,
    ) -> Result<xactor::Addr<SignallingUpdater>> {
        let signalling_updater = xactor::Supervisor::start(move ||
            SignallingUpdater {
                db: db.clone(),
                server_keys: server_keys.clone(),
            }
        ).await?;
        Ok(signalling_updater)
    }
}
