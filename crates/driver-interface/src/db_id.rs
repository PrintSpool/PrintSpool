use std::ops::Range;

/// A database key for collection C (zero-sized wrapper for a u64 identifier)
#[derive(Clone, Copy, PartialEq, PartialOrd, Debug)]
pub struct DbId<C>(pub u64);

impl<C> Default for DbId<C> {
    fn default() -> Self {
        Self(rand::random())
    }
}

impl<C> DbId<C> {
    pub fn any() -> Range<Self> {
        Range {
            start: Self(u64::MIN),
            end: Self(u64::MAX),
        }
    }
}

impl<C> TryFrom<&async_graphql::ID> for DbId<C> {
    fn try_from(value: &async_graphql::ID) -> Self {
        let mut buf = [0u8; 8];

        bs58::decode(value.0).into(&mut buf)?;
        let id = Self(u64::from_be_bytes(buf));

        Ok(id)
    }

    type Error = eyre::Error;
}

impl<C> From<&DbId<C>> for async_graphql::ID {
    fn from(value: &DbId<C>) -> Self {
        Self(bs58::encode(value.0.to_be_bytes()).into_string())
    }
}

impl<C> Option<DbId<C>> {
    pub fn or_any_id(&self) -> Range<DbId<C>> {
        if let Some(id) = self {
            Range { start: id, end: id }
        } else {
            DbId::any()
        }
    }
}
