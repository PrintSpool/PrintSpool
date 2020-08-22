use std::collections::HashMap;
use anyhow::{
    anyhow,
    Result,
    Context as _,
};
use futures::stream::{
    self,
    StreamExt,
    // TryStreamExt,
};
use futures::future;
use async_trait::async_trait;
use std::convert::{
    TryInto,
    TryFrom,
};

mod scoped_tree;
pub use scoped_tree::{
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
    'static
    + Sized
    + Send
    + Clone
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

    fn key(id: u64) -> Vec<u8> {
        let id = id
            .to_be_bytes()
            .to_vec();

        let prefix = Self::prefix();

        let key = [prefix, id].concat();

        key
    }

    // fn get_id_from_key(key: &sled::IVec) -> Result<u64> {
    //     let prefix_bytes = Self::prefix().len();

    //     let id = key.subslice(prefix_bytes, key.len());
    //     let id = u64::from_le_bytes(id.try_into()?);

    //     Ok(id)
    // }

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

    fn first_opt(db: &sled::Db) -> VersionedModelResult<Option<Self>> {
        let item = db.get_gt(Self::prefix())
            .map_err(|source| {
                VersionedModelError::GetFirstError{
                    namespace: Self::NAMESPACE,
                    source,
                }
            })?
            .map(|(_key, val)| val.try_into())
            .transpose()?;

        Ok(item)
    }

    fn first(db: &sled::Db) -> VersionedModelResult<Self> {
        Self::first_opt(&db)?
            .ok_or_else(|| {
                VersionedModelError::NotFound{
                    namespace: Self::NAMESPACE,
                    id: None,
                }
            })
    }

    fn remove(db: &impl ScopedTree, id: u64) -> VersionedModelResult<Option<Self>> {
        let item = db.remove(Self::key(id))
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
        trace!("get_opt {:?} {:?}", id, Self::NAMESPACE);
        let item = db.get(Self::key(id))
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

    fn get_opt_and_update<F>(db: &impl ScopedTree, id: u64, f: F) -> VersionedModelResult<Option<Self>>
    where
        F: Send + Fn(Option<Self>) -> Option<Self>
    {
        let item = db.transaction(move |db| {
            let item = Self::get_opt(&db, id)?;
            let item = f(item);

            if let Some(item) = item {
                let item = item.insert(&db)?;
                Ok(Some(item))
            } else {
                Ok(None)
            }
        })
            .with_context(|| "Transaction Error")?;

        Ok(item)
    }

    fn get_and_update<F>(db: &impl ScopedTree, id: u64, f: F) -> VersionedModelResult<Self>
    where
        F: Send + Fn(Self) -> Self
    {
        let item = Self::get_opt_and_update(db, id, move |item| {
            item.map(|item| f(item))
        })?
            .ok_or_else(|| {
                VersionedModelError::NotFound{
                    namespace: Self::NAMESPACE,
                    id: Some(id),
                }
            })?;

        Ok(item)
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
        let key = Self::key(self.get_id());

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

    fn watch_id(db: &sled::Db, id: u64) -> Result<stream::BoxStream<Result<Event<Self>>>> {
        let key = Self::key(id);
        let subscriber = db.watch_prefix(key);

        let events = stream::iter(subscriber)
            .map(transform_event::<Self>)
            .boxed();

        Ok(events)
    }

    fn watch_all(db: &sled::Db) -> stream::BoxStream<Result<Event<Self>>> {
        let subscriber = db.watch_prefix(Self::prefix());

        stream::iter(subscriber)
            .map(transform_event::<Self>)
            .boxed()
    }

    // Note: This is not optimized at all and stores a complete list of items in memory.
    //
    // Possible future optimizations:
    // - Share a single previous state collection for multiple watch_changes calls
    // - Store the previous states in Sled (Q: how would new watches rehydrate the previous state?)
    fn watch_all_changes(db: &sled::Db) -> Result<stream::BoxStream<Result<Change<Self>>>> {
        let state = Self::scan(&db)
            .map(|item|
                item.map(|item|
                    (Self::key(item.get_id()), item)
                )
            )
            .collect::<Result<HashMap<Vec<u8>, Self>>>()?;

        let changes = Self::watch_all(&db)
            .scan(state, |state, event| {
                info!("{:?} changes event", Self::NAMESPACE);
                match event {
                    Ok(Event::Insert{ key, value: next }) => {

                        let previous = state.insert(
                            Self::key(next.get_id()),
                            next.clone(),
                        );

                        let change = Change {
                            key,
                            previous,
                            next: Some(next),
                        };

                        future::ready(Some(Ok(change)))
                    }
                    Ok(Event::Remove { key }) => {
                        // let id = Self::get_id_from_key(&key);
                        let previous = state.remove(&key.to_vec());

                        let change = Change {
                            key,
                            previous,
                            next: None,
                        };

                        future::ready(Some(Ok(change)))
                    }
                    Err(err) => future::ready(Some(Err(err)))
                }
            });

        Ok(changes.boxed())
    }
}

#[derive(Debug)]
pub enum Event<T> {
    Insert { key: sled::IVec, value: T },
    Remove { key: sled::IVec },
}

#[derive(Debug)]
pub struct Change<T: VersionedModel> {
    pub key: sled::IVec,
    pub previous: Option<T>,
    pub next: Option<T>,
}

fn transform_event<T: VersionedModel>(event: sled::Event) -> Result<Event<T>> {
    match event {
        sled::Event::Insert{ key, value } => {
            value.try_into().map(|value| {
                Event::Insert { key, value }
            })
        }
        sled::Event::Remove { key } => {
            Ok(Event::Remove { key })
        }
    }
}
