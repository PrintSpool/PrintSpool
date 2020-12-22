// use chrono::prelude::*;
// use async_graphql::*;
// use serde::{Deserialize, Serialize};

// use super::{ Invite, InviteR3 };
// #[derive(Debug, Serialize, Deserialize, Clone)]
// pub struct InviteR2 {
//     pub id: u32,
//     pub public_key: String,
//     pub is_admin: bool,
//     pub created_at: DateTime<Utc>,

//     pub slug: Option<String>,
// }

// impl From<InviteR2> for Invite {
//     fn from(r2: InviteR2) -> Self {
//         InviteR3 {
//             id: r2.id,
//             public_key: r2.public_key,
//             is_admin: r2.is_admin,
//             created_at: r2.created_at,
//             slug: r2.slug,
//             private_key: None,
//         }.into()
//     }
// }
