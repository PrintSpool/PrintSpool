use anyhow::{
  anyhow,
  Result,
  Context as _,
};
use async_graphql::ID;
use async_trait::async_trait;
use std::convert::{
  TryInto,
  TryFrom,
};

#[async_trait]
pub trait VersionedModel: Sized + Send + TryFrom<sled::IVec, Error = anyhow::Error> {
  type Entry:
    Sized
    + Send
    + Into<Self>
    + From<Self>
    + serde::Serialize
    + for<'de> serde::Deserialize<'de>;
  const NAMESPACE: &'static str;

  fn get_id(&self) -> &ID;

  fn prefix() -> Vec<u8> {
    format!("{}#", &Self::NAMESPACE)
      .into_bytes()
  }

  fn key(id: &ID) -> Result<Vec<u8>> {
    let id = id.parse::<u64>()
      .with_context(|| format!("Invalid ID: {}", id.as_str()))?
      .to_be_bytes()
      .to_vec();
 
    let prefix = Self::prefix();

    let key = [prefix, id].concat();

    Ok(key)
  }

  fn generate_id(db: &sled::Db) -> Result<ID> {
    db.generate_id()
        .map(|id| id.into())
        .with_context(|| format!("Error generating {:} id", &Self::NAMESPACE))
  }

  async fn get_optional(id: &ID, db: &sled::Db) -> Result<Option<Self>> {
    db.get(Self::key(id)?)
        .with_context(|| format!("Unable to get {:}", Self::NAMESPACE))?
        .map(|iv_vec| iv_vec.try_into())
        .transpose()
  }

  async fn get(id: &ID, db: &sled::Db) -> Result<Self> {
    Self::get_optional(id, db)
      .await?
      .ok_or(anyhow!("{} {:?} not found", &Self::NAMESPACE, id))
  }

  async fn flush(db: &sled::Db) -> Result<()> {
    let namespace = Self::NAMESPACE;

    db.flush_async()
      .await
      .with_context(|| format!("Unable to flush database for {}", namespace))?;

    Ok(())
  }

  async fn insert(self, db: &sled::Db) -> Result<Self> {
    let key = Self::key(self.get_id())?;
    let entry = Self::Entry::from(self);

    let bytes = serde_cbor::to_vec(&entry)
        .with_context(|| format!("Unable to serialize in {}::insert", Self::NAMESPACE))?;

    db.insert(key, bytes)
        .with_context(|| format!("Unable to insert {}", Self::NAMESPACE))?;

    Self::flush(db).await?;

    Ok(entry.into())
  }

  async fn scan(db: &sled::Db) -> Box<dyn Iterator<Item = Result<Self>>> {
    let iter = db.scan_prefix(Self::prefix())
        .values()
        .map(|iv_vec: sled::Result<sled::IVec>| {
            iv_vec
                .with_context(|| format!("Error scanning {}", Self::NAMESPACE))
                .and_then(|iv_vec| iv_vec.try_into())
        });

      Box::new(iter)
  }

  fn watch(&self, db: &sled::Db) -> Result<sled::Subscriber> {
    let key = Self::key(self.get_id())?;
    let subscriber = db.watch_prefix(key);
    Ok(subscriber)
  }

  fn watch_all(db: &sled::Db) -> sled::Subscriber {
    db.watch_prefix(Self::prefix())
  }
}
