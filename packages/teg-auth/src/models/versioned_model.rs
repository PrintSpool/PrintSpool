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
pub trait VersionedModel:
     Sized
    + Send
    + TryFrom<sled::IVec, Error = anyhow::Error>
    + for<'a> TryFrom<&'a [u8], Error = anyhow::Error> {
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

    async fn get_opt(db: &sled::Db, id: &ID) -> Result<Option<Self>> {
        db.get(Self::key(id)?)
                .with_context(|| format!("Unable to get {:}", Self::NAMESPACE))?
                .map(|iv_vec| iv_vec.try_into())
                .transpose()
    }

    async fn get(db: &sled::Db, id: &ID) -> Result<Self> {
        Self::get_opt(db, id)
            .await?
            .ok_or(anyhow!("{} {:?} not found", &Self::NAMESPACE, id))
    }

    async fn fetch_and_update<F>(db: &sled::Db, id: &ID, mut f: F) -> Result<Option<Self>>
    where
        F: Send + FnMut(Option<Self>) -> Option<Self>
    {
        let key = Self::key(id)?;
        let out = db.fetch_and_update(key, |iv_vec| {
            // TODO: Corrupted data is dropped here. Need a try_fetch_and_update fn
            // to allow the user to respond to bad data.
            let item: Option<Self> = iv_vec
                .map(|iv_vec| iv_vec.try_into().ok())
                .flatten();

            // TODO: Serialization failure could also cause data loss here
            let (_, bytes) = f(item)?.into_bytes().ok()?;
            Some(bytes)
        })?;

        out 
            .map(|iv_vec| iv_vec.try_into())
            .transpose()
    }

    async fn flush(db: &sled::Db) -> Result<()> {
        let namespace = Self::NAMESPACE;

        db.flush_async()
            .await
            .with_context(|| format!("Unable to flush database for {}", namespace))?;

        Ok(())
    }

    fn into_bytes(self) -> Result<(Self, Vec<u8>)> {
        let entry = Self::Entry::from(self);

        let bytes = serde_cbor::to_vec(&entry)
            .with_context(|| format!("Error serializing {}", Self::NAMESPACE))?;

        Ok((entry.into(), bytes))
    }

    async fn insert(self, db: &sled::Db) -> Result<Self> {
        let key = Self::key(self.get_id())?;

        let (new_self, bytes) = self.into_bytes()?;

        db.insert(key, bytes)
                .with_context(|| format!("Unable to insert {}", Self::NAMESPACE))?;

        Self::flush(db).await?;

        Ok(new_self)
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

    async fn find_opt<F>(db: &sled::Db, mut f: F) -> Result<Option<Self>>
    where
        F: Send + FnMut(&Self) -> bool
    {
        Self::scan(db)
            .await
            .find(|entry| 
                match entry {
                    Ok(entry) => f(entry),
                    Err(_) => true,
                }
            )
            .transpose()
    }

    async fn find<F>(db: &sled::Db, f: F) -> Result<Self>
    where
        F: Send + FnMut(&Self) -> bool
    {
        Self::find_opt(db, f)
            .await?
            .ok_or(anyhow!("{} not found", &Self::NAMESPACE))
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
