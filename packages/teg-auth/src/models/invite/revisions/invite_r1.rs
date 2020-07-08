use chrono::prelude::*;
use juniper::{
    ID,
};
use serde::{Deserialize, Serialize};

// use super::{ Invite, InviteR2 };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InviteR1 {
    pub id: ID,
    pub public_key: String,
    pub is_admin: bool,
    pub created_at: DateTime<Utc>,

    pub slug: Option<String>,
    pub private_key: Option<String>,
}

// impl From<InviteR1> for Invite {
//     fn from(r1: InviteR1) -> Self {
//         InviteR2 {
//             id: r1.id,
//             public_key: r1.public_key,
//             is_admin: r1.is_admin,
//             created_at: r1.created_at,
//             slug: None,
//         }.into()
//     }
// }
