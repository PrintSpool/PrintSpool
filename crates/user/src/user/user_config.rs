use serde::{Deserialize, Serialize};
use schemars::JsonSchema;

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct UserConfig {
    /// # Name
    pub name: String,
    /// # Admin
    pub is_admin: bool,
}
