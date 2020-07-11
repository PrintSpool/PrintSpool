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
  type Entry: Into<Self> + From<Self> + serde::Serialize + for<'de> serde::Deserialize<'de>;
  const NAMESPACE: &'static str;

  fn get_id(&self) -> &ID;

  fn key(id: &ID) -> Result<Vec<u8>> {
    // let prefix_bytes = format!("{}#", DB_PREFIX).bytes();
    let id = id.parse::<u64>()
      .with_context(|| format!("Invalid ID: {}", id.as_str()))?;
  
    let key_tuple = (&Self::NAMESPACE, id.to_be_bytes());
  
    serde_cbor::to_vec(&key_tuple)
      .with_context(|| format!("Error serializing key for {}", &Self::NAMESPACE))
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
    VersionedModel::get_optional(id, db)
      .await?
      .ok_or(anyhow!("{} {:?} not found", &Self::NAMESPACE, id))
  }

  async fn insert(self, db: &sled::Db) -> Result<Self> {
    let key = Self::key(self.get_id())?;
    let entry = Self::Entry::from(self);

    let bytes = serde_cbor::to_vec(&entry)
        .with_context(|| format!("Unable to serialize in {}::insert", Self::NAMESPACE))?;

    db.insert(key, bytes)
        .with_context(|| format!("Unable to insert {}", Self::NAMESPACE))?;

    Ok(entry.into())
  }

  async fn scan(db: &sled::Db) -> Box<dyn Iterator<Item = Result<Self>>> {
    let iter = db.scan_prefix(Self::NAMESPACE)
        .values()
        .map(|iv_vec: sled::Result<sled::IVec>| {
            iv_vec
                .with_context(|| format!("Error scanning {}", Self::NAMESPACE))
                .and_then(|iv_vec| iv_vec.try_into())
        });

      Box::new(iter)
  }
}
