use std::time::Duration;
use std::sync::Arc;
use std::path::Path;
use sha2::{ Sha512, Digest };
use serde::{Serialize, Deserialize};

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

use async_std::prelude::*;
use async_std::fs::File;

pub async fn schedule_backups(
    db: Arc<sled::Db>,
    backups_dir: &str,
    every: Duration,
) -> crate::Result<()> {
    let backups_dir = backups_dir.to_string();
    let db = Arc::clone(&db);

    async_std::stream::repeat(())
        .map(|_| Ok(()))
        .try_for_each(|_| {
        let backups_dir = backups_dir.to_string();
        let db = Arc::clone(&db);
        async move {
            // TODO: backup durations based on previous backup time
            let duration = every.clone();

            info!("Sled DB backup scheduled for {:?} from now", duration);
            async_std::task::sleep(duration).await;

            info!("Backing up Sled DB...");
            let result = backup(&db, &backups_dir).await?;
            info!("Backing up Sled DB... [DONE]");

            Ok(())
            }
        })
        .await
}

#[derive(Serialize, Deserialize, Debug, Clone)]
enum BackupRow {
    MetaInfo(MetaInfo),
    Collection(Collection),
    TreeEntry(TreeEntry),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct MetaInfo {
    sha512: Vec<u8>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Collection {
    r#type: Vec<u8>,
    name: Vec<u8>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct TreeEntry {
    key: Vec<u8>,
    value: Vec<u8>,
}

pub async fn backup(db: &sled::Db, backups_dir: &str) -> crate::Result<()> {
    let file_path = Path::new(backups_dir).join("test.txt");
    let f = File::create(file_path).await?;

    let hasher = Sha512::new();

    // let b64_encode = |value| {
    // base64::encode_config(value, base64::STANDARD_NO_PAD)
    // };

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
                if let [key, value] = entry.as_slice() {
                    BackupRow::TreeEntry(
                        TreeEntry {
                            key: key.clone(),
                            value: value.clone(),
                        }
                    )
                } else {
                    panic!("Invalid Sled Backup Entry");
                }
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
            Ok(row) as crate::Result<BackupRow>
        })
        .try_fold(fold_ctx, move |fold_ctx, row| async move {
            let (mut f, mut hasher) = fold_ctx;

            let row = write_row(&mut f, row).await?;
            // Add the row to the checksum hash
            hasher.update(row);

            Ok((f, hasher))
        })
        .await?;

    let metaRow = BackupRow::MetaInfo( MetaInfo {
        sha512: hasher.finalize().into_iter().collect(),
    });

    write_row(&mut f, metaRow).await?;

    f.flush()
        .await
        .with_context(|| "Error saving sled backup")?;

    Ok(())
}

pub async fn restore(db: &sled::Db) {
}
