use serde::{Deserialize, Serialize};

mod user_r1;
pub use user_r1::UserR1;

pub type User = UserR1;

#[derive(Debug, Serialize, Deserialize)]
pub enum UserDBEntry {
    UserR1 (UserR1),
}

impl From<UserDBEntry> for User {
    fn from(entry: UserDBEntry) -> Self {
        match entry {
            UserDBEntry::UserR1(user) => user.into(),
        }
    }
}
