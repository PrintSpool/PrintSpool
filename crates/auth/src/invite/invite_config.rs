use serde::{Deserialize, Serialize};
use schemars::JsonSchema;

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct InviteConfig {
    /// # Admin Access Invite
    #[serde(default)]
    pub is_admin: bool,
    /// # Invite Name (Optional)
    /// Naming invites can help keep track of what the invite was created for.
    #[serde(default)]
    pub name: Option<String>,
}
