use std::time::Duration;
use std::sync::Arc;
use std::path::Path;

use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use futures::stream::{
    // self,
    StreamExt,
    TryStreamExt,
};
// use futures::future::FutureExt;

use super::backup;

pub async fn schedule_backups(
    db: &Arc<sled::Db>,
    backups_dir: &Path,
    max_backups: u32,
    every: Duration,
) -> Result<()> {
    let backups_dir = backups_dir.clone();
    let db = Arc::clone(&db);

    async_std::stream::repeat(())
        .map(|_| Ok(()))
        .try_for_each(|_| {
        let backups_dir = backups_dir.clone();
        let db = Arc::clone(&db);
        async move {
            // TODO: backup durations based on previous backup time
            let duration = every.clone();

            info!("Sled DB backup scheduled for {:?} from now", duration);
            async_std::task::sleep(duration).await;

            info!("Backing up Sled DB...");
            backup(&db, &backups_dir, max_backups).await?;
            info!("Backing up Sled DB... [DONE]");

            Ok(())
            }
        })
        .await
}
