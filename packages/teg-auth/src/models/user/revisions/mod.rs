use serde::{Deserialize, Serialize};
use versioned_sled_model::VersionedSledModel;

mod user_r1;
pub use user_r1::UserR1;

pub type User = UserR1;

#[derive(Debug, Serialize, Deserialize, VersionedSledModel)]
pub enum UserDBEntry {
    UserR1 (UserR1),
}

impl crate::models::VersionedModel for User {
    type Entry = UserDBEntry;
    const NAMESPACE: &'static str = "User";

    fn get_id(&self) -> u64 {
        self.id
    }
}
