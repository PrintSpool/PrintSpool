use eyre::{
  // eyre,
  Result,
  Context as _,
};

use super::super::{
    backup,
    restore,
    get_latest_backup,
};

async fn backup_and_restore_inner() -> Result<()> {
    let tmp_db_dir = tempfile::tempdir()
      .with_context(|| "Unable to create tmp directory")?;
    let tmp_backup_dir = tempfile::tempdir()
      .with_context(|| "Unable to create tmp directory")?;

    let db = sled::open(&tmp_db_dir)
      .with_context(|| "Unable to create tmp db")?;

    // create some data
    db.insert("test", "wat")?;

    // Backup the database
    backup(&db, &tmp_backup_dir.path(), 3)
      .await?;

    let backup_path = get_latest_backup(&tmp_backup_dir.path())
      .await?;

    // wipe data before restoring
    db.remove("test")?;
    assert_eq!(db.get("test")?, None);

    // Restore the database
    restore(&db, &backup_path)
      .await?;

    // TODO: assert the data matches the pre-backup version
    assert_eq!(db.get("test")?, Some("wat".into()));

    drop(tmp_db_dir);
    drop(tmp_backup_dir);
    Ok(())
}

#[async_std::test]
async fn backup_and_restore() -> Result<()> {
  backup_and_restore_inner()
    .await
    .unwrap();

  // assert_eq!(result, Ok(()) as Result<()>);

  Ok(())
}
