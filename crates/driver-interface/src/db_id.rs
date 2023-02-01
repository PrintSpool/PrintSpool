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

impl<C> From<&async_graphql::ID> for DbId<C> {
    fn from(value: &async_graphql::ID) -> Self {
        Self(value.0)
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
