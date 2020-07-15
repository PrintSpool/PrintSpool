use std::time::Duration;
use std::sync::Arc;
use std::path::{PathBuf, Path};
use std::collections::HashMap;
use lazy_static::lazy_static;

use regex::Regex;
use sha2::{ Sha256, Digest };
use serde::{ Serialize, Deserialize };
use itertools::{ Itertools };
use chrono::prelude::*;

use anyhow::{
    anyhow,
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
use async_std::io::BufReader;

pub async fn schedule_backups(
    db: &Arc<sled::Db>,
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
            backup(&db, &backups_dir).await?;
            info!("Backing up Sled DB... [DONE]");

            Ok(())
            }
        })
        .await
}

#[derive(Serialize, Deserialize, Debug, Clone)]
enum BackupRow {
    // MetaData(MetaData),
    Collection(Collection),
    TreeEntry(TreeEntry),
}

// #[derive(Serialize, Deserialize, Debug, Clone)]
// struct MetaData {
//     Sha256: Vec<u8>,
// }

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq, std::hash::Hash)]
struct Collection {
    r#type: Vec<u8>,
    name: Vec<u8>,
}

type TreeEntry = Vec<Vec<u8>>;

pub async fn backup(db: &sled::Db, backups_dir: &str) -> crate::Result<()> {
    // TODO: log rotate / delete older backups
    create_backup_file(&db, &backups_dir).await
}

pub async fn create_backup_file(db: &sled::Db, backups_dir: &str) -> crate::Result<()> {
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

pub async fn restore_latest_backup(
    db: &sled::Db,
    backups_dir: &str,
) -> crate::Result<()> {
    let dir = std::fs::read_dir(&backups_dir)?;

    let files: Vec<Option<PathBuf>> = dir
        .map(|entry| -> crate::Result<Option<PathBuf>> {
            let entry = entry
                .with_context(|| "Error reading file in backup directory")?;

            let path = entry.path();

            if path.is_dir() || !path.ends_with(".bck") {
                Ok(None)
            } else {
                Ok(Some(path))
            }
        })
        .try_collect()?;

    let files = files
        .into_iter()
        .filter_map(|option| option)
        .sorted();

    let (valid_backup_file, _) = stream::iter(files)
        .then(|file_path| async move {
            validate_backup(&file_path)
                .await
                .map_err(|err| {
                    error!("Skipping Corrupted Backup: {:?}", err);
                    err
                })
        })
        .filter_map(|result| futures::future::ready(result.ok()))
        .boxed()
        .into_future()
        .await;

    let valid_backup_file = valid_backup_file
        .ok_or(anyhow!("No valid backups found"))?;
    
    restore_from_file(&db, &valid_backup_file).await?;

    Ok(())
}

pub async fn validate_backup(
    file_path: &PathBuf,
) -> crate::Result<File> {
    let file_name = file_path.file_name()
        .ok_or(anyhow!("Unable to read file name of backup file"))?
        .to_str()
        .ok_or(anyhow!("Unable to read file name of backup file"))?;

    let mut f = std::fs::File::create(file_path)?;

    // Parse the file name
    lazy_static! {
        static ref FILE_NAME_REGEX: Regex = Regex::new(r"\d+_([a-zA-Z0-9]).bck").unwrap();
    }

    // Validate the checksum
    let expected_hash = FILE_NAME_REGEX.captures(file_name)
        .and_then(|cap| cap.get(1))
        .ok_or(anyhow!("Invalid backup file name: {}", file_name))?
        .as_str();

    let mut hasher = Sha256::new();
    std::io::copy(&mut f, &mut hasher)?;
    let hash = hex::encode(hasher.finalize());

    if hash != expected_hash {
        Err(anyhow!("Hash of backup file ({}) does not match file name ({})", hash, file_name))?
    }

    // Seek back to the top of the top of the file
    let mut f = async_std::fs::File::from(f);
    f.seek(async_std::io::SeekFrom::Start(0)).await?;

    Ok(f)
}

pub async fn restore_from_file(
    db: &sled::Db,
    f: &File,
) -> crate::Result<()> {
    let f = BufReader::new(f);

    fn parse_line(line: std::io::Result<String>) -> crate::Result<BackupRow> {
        let line = line
            .with_context(|| "Unable to read backup file")?;
        let row = serde_json::from_str(&line)
            .with_context(|| format!("Invalid JSON line in backup file: {:?}", line))?;
        Ok(row)
    }

    let lines: Vec<BackupRow> = f.lines()
        .map(parse_line)
        .try_collect()
        .await?;

    let mut lines = lines
        .into_iter();

    let first_line = lines.next()
        .ok_or(anyhow!("Empty backup file"))?;

    let mut collection = match first_line {
        BackupRow::Collection(c) => {
            Ok(Arc::new(c))
        }
        invalid_first_row => {
            Err(anyhow!("First row must be a collection, found: {:?}", invalid_first_row))
        }
    }?;
    
    let entries_by_collection: HashMap<Arc<Collection>, Vec<TreeEntry>> = lines
        .into_iter()
        .filter_map(|row| {
            match row {
                BackupRow::Collection(c) => {
                    collection = Arc::new(c.clone());
                    // Either::Left(c)
                    None
                }
                BackupRow::TreeEntry(entry) => {
                    // Either::Right((Arc::clone(&collection), entry))
                    Some((Arc::clone(&collection), entry))
                }
            }
        })
        .into_group_map();

    let sled_export = entries_by_collection
        .into_iter()
        .filter_map(|(collection, entries)| {
            let collection = (*collection).clone();
            let entries = entries.into_iter();

            Some((
                collection.r#type,
                collection.name,
                entries,
            ))
        })
        .collect();

    db.import(sled_export);
    Ok(())
}
