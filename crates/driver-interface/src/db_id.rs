use bonsaidb::core::key::Key;
use derive_new::new;
use std::{marker::PhantomData, ops::Range};

/// A database key for collection C (zero-sized wrapper for a u64 identifier)
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Key, Debug, new)]
pub struct DbId<C>(pub u64, #[new(default)] PhantomData<fn() -> C>);

impl<C> Default for DbId<C> {
    fn default() -> Self {
        Self(rand::random(), Default::default())
    }
}

impl<C> DbId<C> {
    pub fn any() -> Range<Self> {
        Range {
            start: Self::new(u64::MIN),
            end: Self::new(u64::MAX),
        }
    }

    pub fn or_any(db_id: Option<Self>) -> Range<Self> {
        if let Some(id) = db_id {
            Range { start: id, end: id }
        } else {
            DbId::any()
        }
    }
}

impl<C> TryFrom<&async_graphql::ID> for DbId<C> {
    fn try_from(value: &async_graphql::ID) -> Self {
        let mut buf = [0u8; 8];

        bs58::decode(value.0).into(&mut buf)?;
        let id = Self::new(u64::from_be_bytes(buf));

        Ok(id)
    }

    type Error = eyre::Error;
}

impl<C> From<&DbId<C>> for async_graphql::ID {
    fn from(value: &DbId<C>) -> Self {
        Self(bs58::encode(value.0.to_be_bytes()).into_string())
    }
}
