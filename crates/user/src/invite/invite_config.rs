use serde::{Deserialize, Serialize};
use schemars::JsonSchema;

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct InviteConfig {
    /// # Admin Access Invite
    pub is_admin: bool,
}
