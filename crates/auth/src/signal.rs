use serde::{Deserialize, Serialize};
use datachannel::SessionDescription;

#[derive(Serialize, Deserialize, Debug)]
#[serde( rename_all = "camelCase" )]
pub struct Signal {
    #[serde(rename = "userID")]
    pub user_id: async_graphql::ID,
    pub email: Option<String>,
    pub email_verified: bool,
    pub invite: Option<String>,
    #[serde(rename = "sessionID")]
    pub session_id: async_graphql::ID,
    pub offer: SessionDescription,
    pub ice_servers: Vec<IceServer>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct IceServer {
    pub url: Option<String>,
    pub urls:  Vec<String>,
    pub username: Option<String>,
    pub credential: Option<String>,
}
