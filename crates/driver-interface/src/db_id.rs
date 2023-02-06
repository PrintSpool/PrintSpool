use bonsaidb::core::key::{Key, KeyEncoding};
use derive_new::new;
use impl_tools::autoimpl;
use serde::{Deserialize, Serialize};
use std::{marker::PhantomData, ops::Range};

/// A database key for collection C (zero-sized wrapper for a u64 identifier)
#[derive(new, Serialize, Deserialize)]
#[autoimpl(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash ignore self.1)]
pub struct DbId<C: 'static>(
    pub u64,
    #[new(default)] PhantomData<&'static fn() -> &'static C>,
);

impl<C> Default for DbId<C> {
    fn default() -> Self {
        Self(rand::random(), Default::default())
    }
}

impl<'k, C> Key<'k> for DbId<C> {
    fn from_ord_bytes(bytes: &'k [u8]) -> Result<Self, Self::Error> {
        Ok(Self::new(u64::from_ord_bytes(bytes)?))
    }
}

impl<'k, C> KeyEncoding<'k, Self> for DbId<C> {
    type Error = <u64 as KeyEncoding<'k, u64>>::Error;

    const LENGTH: Option<usize> = <u64 as KeyEncoding<'k, u64>>::LENGTH;

    fn as_ord_bytes(&'k self) -> Result<std::borrow::Cow<'k, [u8]>, Self::Error> {
        self.0.as_ord_bytes()
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
    fn try_from(value: &async_graphql::ID) -> Result<Self, Self::Error> {
        let mut buf = [0u8; 8];

        bs58::decode(&value.0).into(&mut buf)?;
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
