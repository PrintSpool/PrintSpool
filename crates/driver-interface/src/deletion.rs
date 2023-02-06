use bonsaidb::core::{
    key::{Key, KeyEncoding},
    num_traits::{FromPrimitive, ToPrimitive},
};
use chrono::{DateTime, TimeZone};

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Deletion {
    None,
    Deleted,
}

impl<'k> Key<'k> for Deletion {
    fn from_ord_bytes(bytes: &'k [u8]) -> Result<Self, Self::Error> {
        if bool::from_ord_bytes(bytes)? {
            Ok(Self::Deleted)
        } else {
            Ok(Self::None)
        }
    }
}

impl<'k> KeyEncoding<'k, Self> for Deletion {
    type Error = <bool as KeyEncoding<'k, bool>>::Error;

    const LENGTH: Option<usize> = <bool as KeyEncoding<'k, bool>>::LENGTH;

    fn as_ord_bytes(&'k self) -> Result<std::borrow::Cow<'k, [u8]>, Self::Error> {
        matches!(self, Self::Deleted).as_ord_bytes()
    }
}

impl ToPrimitive for Deletion {
    fn to_u64(&self) -> Option<u64> {
        match self {
            Deletion::None => Some(0),
            Deletion::Deleted => Some(1),
        }
    }

    fn to_i64(&self) -> Option<i64> {
        match self {
            Deletion::None => Some(0),
            Deletion::Deleted => Some(1),
        }
    }
}

impl FromPrimitive for Deletion {
    fn from_u64(n: u64) -> Option<Self> {
        match n {
            0 => Some(Deletion::None),
            1 => Some(Deletion::Deleted),
            _ => None,
        }
    }

    fn from_i64(n: i64) -> Option<Self> {
        match n {
            0 => Some(Deletion::None),
            1 => Some(Deletion::Deleted),
            _ => None,
        }
    }
}

impl<T: TimeZone> From<Option<DateTime<T>>> for Deletion {
    fn from(value: Option<DateTime<T>>) -> Self {
        if value.is_some() {
            Deletion::Deleted
        } else {
            Deletion::None
        }
    }
}
