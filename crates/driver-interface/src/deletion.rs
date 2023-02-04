use bonsaidb::core::{
    key::{EnumKey, Key},
    num_traits::{FromPrimitive, ToPrimitive},
};
use chrono::{DateTime, TimeZone};

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Key)]
pub enum Deletion {
    None,
    Deleted,
}

impl EnumKey for Deletion {}

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
