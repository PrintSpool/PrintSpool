use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use schemars::JsonSchema;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    pub id: crate::DbId,
    pub config: UserConfig,
    pub created_at: DateTime<Utc>,
    pub last_logged_in_at: Option<DateTime<Utc>>,

    pub firebase_uid: String,
    pub is_authorized: bool,
}

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct UserConfig {
    /// # Name
    pub name: String,
    /// # Email
    pub email: Option<String>,
    /// # Email Verified
    pub email_verified: bool,
    /// # Admin
    pub is_admin: bool,
}
