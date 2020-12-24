use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use schemars::JsonSchema;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Invite {
    pub id: crate::DbId,
    pub public_key: String,
    pub created_at: DateTime<Utc>,
    pub config: InviteConfig,

    pub slug: Option<String>,
    pub private_key: Option<String>,
}

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct InviteConfig {
    /// # Admin Access Invite
    pub is_admin: bool,
}
