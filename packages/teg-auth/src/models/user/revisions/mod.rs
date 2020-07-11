use serde::{Deserialize, Serialize};
use versioned_sled_model::VersionedSledModel;

mod user_r1;
pub use user_r1::UserR1;

pub type User = UserR1;

const DB_PREFIX: &str = "users";

#[derive(Debug, Serialize, Deserialize, VersionedSledModel)]
pub enum UserDBEntry {
    UserR1 (UserR1),
}
