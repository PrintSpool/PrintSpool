use serde::{Deserialize, Serialize};
use schemars::JsonSchema;

#[derive(Serialize, Deserialize, JsonSchema, Debug, Default, Clone)]
pub struct UserConfig {
    /// # Admin
    pub is_admin: bool,
}
