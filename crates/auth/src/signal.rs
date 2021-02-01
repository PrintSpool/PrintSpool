use serde::{Deserialize, Serialize};
use datachannel::SessionDescription;

#[derive(Serialize, Deserialize, Debug)]
pub struct Signal {
    #[serde(rename = "user_id")]
    pub user_id: async_graphql::ID,
    pub email: Option<String>,
    pub email_verified: bool,
    #[serde(rename = "sessionID")]
    pub session_id: async_graphql::ID,
    pub offer: SessionDescription,
}
