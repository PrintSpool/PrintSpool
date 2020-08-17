use anyhow::{
    anyhow,
    Result,
    Context as _,
};
// use futures::future::Future;
use async_trait::async_trait;
use std::convert::{
    TryInto,
    TryFrom,
};

mod scoped_tree;
use scoped_tree::{
    ScopedTree,
};

use thiserror::Error;
use sled::transaction::{
    ConflictableTransactionError,
    // ConflictableTransactionResult,
};

#[derive(Error, Debug)]
pub enum VersionedModelError {
    #[error("Error generating {namespace}")]
    GenerateIdError{
        namespace: &'static str,
        source: sled::Error,
    },
    #[error("Unable to get {namespace} from database")]
    GetFirstError {
        namespace: &'static str,
        source: sled::Error,
    },
    #[error("Unable to get {namespace} from database")]
    GetError {
        namespace: &'static str,
        source: ConflictableTransactionError<()>,
    },
    #[error("Unable to remove {namespace} from database")]
    RemoveError {
        namespace: &'static str,
        source: ConflictableTransactionError<()>,
    },
    #[error("{namespace} (ID: {id:?}) not found")]
    NotFound {
        namespace: &'static str,
        id: Option<u64>,
    },
    #[error("Invalid ID: {0}")]
    InvalidID(String),
    #[error("Unable to insert {namespace}")]
    InsertError {
        namespace: &'static str,
        source: ConflictableTransactionError<()>,
    },
    #[error(transparent)]
    Other(#[from] anyhow::Error),  // source and Display delegate to anyhow::Error
}

pub type VersionedModelResult<T> = std::result::Result<T, VersionedModelError>;
// type SledResult<T> = ConflictableTransactionResult<T, VersionedModelError>;

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

    fn get_id(&self) -> u64;

    fn prefix() -> Vec<u8> {
        format!("{}#", &Self::NAMESPACE)
            .into_bytes()
    }

    fn key(id: u64) -> VersionedModelResult<Vec<u8>> {
        let id = id
            .to_be_bytes()
            .to_vec();

        let prefix = Self::prefix();

        let key = [prefix, id].concat();

        Ok(key)
    }

    fn generate_id(db: &sled::Db) -> VersionedModelResult<u64> {
        db.generate_id()
        .map(|id| id.into())
        .map_err(|source| {
                    VersionedModelError::GenerateIdError {
                        namespace: Self::NAMESPACE,
                        source,
                    }
                })
    }

    fn first(db: &sled::Db) -> VersionedModelResult<Self> {
        let (_key, val) = db.get_gt(Self::prefix())
            .map_err(|source| {
                VersionedModelError::GetFirstError{
                    namespace: Self::NAMESPACE,
                    source,
                }
            })?
            .ok_or_else(|| {
                VersionedModelError::NotFound{
                    namespace: Self::NAMESPACE,
                    id: None,
                }
            })?;

        Ok(val.try_into()?)
    }

    fn remove(db: &impl ScopedTree, id: u64) -> VersionedModelResult<Option<Self>> {
        let item = db.remove(Self::key(id)?)
                .map_err(|source| {
                    VersionedModelError::RemoveError{
                        namespace: Self::NAMESPACE,
                        source,
                    }
                })?
                .map(|iv_vec| iv_vec.try_into())
                .transpose()?;
        Ok(item)
    }

    fn get_opt(db: &impl ScopedTree, id: u64) -> VersionedModelResult<Option<Self>> {
        let item = db.get(Self::key(id)?)
                .map_err(|source| {
                    VersionedModelError::GetError{
                        namespace: Self::NAMESPACE,
                        source,
                    }
                })?
                .map(|iv_vec| iv_vec.try_into())
                .transpose()?;
        Ok(item)
    }

    fn get(db: &impl ScopedTree, id: u64) -> VersionedModelResult<Self> {
        Self::get_opt(db, id)?
            .ok_or_else(|| {
                VersionedModelError::NotFound{
                    namespace: Self::NAMESPACE,
                    id: Some(id),
                }
            })
    }

    fn fetch_and_update<F>(db: &sled::Db, id: u64, mut f: F) -> Result<Option<Self>>
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

    fn into_bytes(self) -> VersionedModelResult<(Self, Vec<u8>)> {
        let entry = Self::Entry::from(self);

        let bytes = serde_cbor::to_vec(&entry)
            .with_context(|| format!("Error serializing {}", Self::NAMESPACE))?;

        Ok((entry.into(), bytes))
    }

    // async fn insert(self, db: &sled::Db) -> Result<Self> {
    // async fn insert<Db>(self, db: &std::ops::Deref<Target = Db>) -> Result<Self>
    // where
    //     Db: ScopedTree,
    fn insert(self, db: &impl ScopedTree) -> VersionedModelResult<Self> {
        let key = Self::key(self.get_id())?;

        let (new_self, bytes) = self.into_bytes()?;

        db.insert(key, bytes)
                .map_err(|source| {
                    VersionedModelError::InsertError {
                        namespace: Self::NAMESPACE,
                        source,
                    }
                })?;

        Ok(new_self)
    }

    fn scan(db: &sled::Db) -> Box<dyn Iterator<Item = Result<Self>>> {
        let iter = db.scan_prefix(Self::prefix())
                .values()
                .map(|iv_vec: sled::Result<sled::IVec>| {
                        iv_vec
                                .with_context(|| format!("Error scanning {}", Self::NAMESPACE))
                                .and_then(|iv_vec| iv_vec.try_into())
                });

        Box::new(iter)
    }

    fn find_opt<F>(db: &sled::Db, mut f: F) -> Result<Option<Self>>
    where
        F: Send + FnMut(&Self) -> bool
    {
        Self::scan(db)
            .find(|entry| 
                match entry {
                    Ok(entry) => f(entry),
                    Err(_) => true,
                }
            )
            .transpose()
    }

    fn find<F>(db: &sled::Db, f: F) -> Result<Self>
    where
        F: Send + FnMut(&Self) -> bool
    {
        Self::find_opt(db, f)?
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
