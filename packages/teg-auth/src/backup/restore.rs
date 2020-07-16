// use std::time::Duration;
use std::sync::Arc;
use std::path::{PathBuf};
use std::collections::HashMap;
use lazy_static::lazy_static;

use regex::Regex;
use sha2::{ Sha256, Digest };
// use serde::{ Serialize, Deserialize };
use itertools::{ Itertools };
// use chrono::prelude::*;

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

use super::{
    BackupRow,
    Collection,
    TreeEntry,
    get_backup_files,
};

pub async fn restore_latest_backup(
    db: &sled::Db,
    backups_dir: &str,
) -> Result<()> {
    let files = get_backup_files(&backups_dir)?;

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
) -> Result<File> {
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
) -> Result<()> {
    let f = BufReader::new(f);

    fn parse_line(line: std::io::Result<String>) -> Result<BackupRow> {
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
