// use std::time::Duration;
// use std::sync::Arc;
use std::path::{PathBuf, Path};
// use std::collections::HashMap;
use anyhow::{
    // anyhow,
    Result,
    Context as _,
};

use futures::stream::{
    self,
    StreamExt,
    TryStreamExt,
};
// use futures::future::FutureExt;

use async_std::prelude::*;
use async_std::fs::File;

use chrono::prelude::*;
use sha2::{ Sha256, Digest };

use super::{
    BackupRow,
    Collection,
    // TreeEntry,
    get_backup_files,
};

pub async fn backup(db: &sled::Db, backups_dir: &str, max_backups: u32) -> Result<()> {
    let backup_files: Vec<PathBuf> = get_backup_files(&backups_dir)?.collect();

    if let Some(oldest_backup) = backup_files.last() {
        if backup_files.len() as u32 >= max_backups {
            std::fs::remove_file(&oldest_backup)
                .with_context(|| "Error rotating backup files")?;
        }
    }

    let tmp_path = Path::new(backups_dir).join("in-progress-backup.tmp");

    let _ = std::fs::remove_file(&tmp_path);
    let f = File::create(&tmp_path).await?;

    let hasher = Sha256::new();

    let backup_iter = db.export()
        .into_iter()
        .map(|collection_backup| {
            let (
                collection_type,
                collection_name,
                entries,
            ) = collection_backup;

            let collection_row = BackupRow::Collection(
                Collection {
                    r#type: collection_type,
                    name: collection_name,
                },
            );

            let entries_iter = entries.map(|entry| {
                BackupRow::TreeEntry(entry)
            });

            vec![collection_row].into_iter()
            .chain(entries_iter)
        })
        .flatten();

    async fn write_row(f: &mut File, row: BackupRow) -> Result<String> {
        // Delimit inline JSON formatted rows by newlines
        let row = serde_json::to_string(&row)
            .with_context(|| "Unable to serialize sled backup")?;
        let row = format!("{}\n", row.replace("\n", ""));

        // Write the row to the backup file
        f.write(row.as_bytes()).await
            .with_context(|| "Unable to write to sled backup")?;

        Ok(row)
    }

    let fold_ctx = (f, hasher);

    let (mut f, hasher) = stream::iter(backup_iter)
        .map(|row: BackupRow| {
            Ok(row) as Result<BackupRow>
        })
        .try_fold(fold_ctx, move |fold_ctx, row| async move {
            let (mut f, mut hasher) = fold_ctx;

            let row = write_row(&mut f, row).await?;
            // Add the row to the checksum hash
            hasher.update(row);

            Ok((f, hasher))
        })
        .await?;

    let sha256 = hex::encode(hasher.finalize());
    let millis = Utc::now().timestamp_millis();

    f.flush()
        .await
        .with_context(|| "Error saving sled backup")?;

    let backup_name = format!("{}_{}.bck", millis, sha256);

    let final_path = Path::new(backups_dir).join(backup_name);

    std::fs::rename(&tmp_path, &final_path)
        .with_context(|| "Unable to save backup")?;

    Ok(())
}
