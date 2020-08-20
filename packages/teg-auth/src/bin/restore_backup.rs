#[macro_use] extern crate log;
use std::path::PathBuf;
use clap::Clap;

use anyhow::{
  Context as _,
  Result,
};

use teg_auth::{
  init,
  backup::{
      restore,
      get_latest_backup,
  },
};


/// Restore Teg's Sled Database from a backup. By default Teg takes a backup once a week and keeps 4
/// weeks of backups to restore from.
#[derive(Clap)]
#[clap(version = "1.0", author = "D1plo1d")]
struct Opts {
    /// The backup file to restore from. Default: latest backup
    backup_file: Option<String>,
}

#[async_std::main]
async fn main() -> Result<()> {
  let opts: Opts = Opts::parse();

  let context = init().await
    .with_context(|| "Teg must be stopped before restoring by running: sudo snap stop tegh")?;

  let backup_path = if let Some(backup_path) = opts.backup_file {
    PathBuf::from(&backup_path)
  } else {
    let backups_dir = context.machine_config
      .load()
      .backups_dir();

    get_latest_backup(&&backups_dir).await?
  };

  let _ = restore(&context.db, &backup_path).await;

  info!("Successfully restored from backup");
  info!("Teg is stopped. To restart Teg run: sudo snap start tegh");

  Ok(())
}
