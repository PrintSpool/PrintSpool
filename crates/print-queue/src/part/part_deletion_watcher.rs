// use async_std::prelude::*;
use async_std::fs;

use futures::stream::StreamExt;
use std::sync::Arc;
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use crate::models::VersionedModel;
use crate::tasks::{
    Part,
};

pub async fn run_part_deletion_watcher(
    ctx: Arc<crate::Context>,
) -> Result<()> {
    let mut part_changes = Part::watch_all_changes(&ctx.db)?;

    loop {
        use crate::models::versioned_model::Change;

        let change = part_changes.next().await
            .ok_or_else(|| anyhow!("part deletion stream unexpectedly ended"))??;

        match change {
            Change { previous: Some(part), next: None, .. } => {
                // clean up files on task deletion
                fs::remove_file(part.file_path).await?;
            }
            _ => {}
        }
    }
}
