use std::convert::TryFrom;
use serde::{Deserialize, Serialize};
use crate::ResultExt;

mod invite_r1;
pub use invite_r1::InviteR1;

// mod invite_r2;
// pub use invite_r2::InviteR2;

// mod invite_r3;
// pub use invite_r3::InviteR3;

pub type Invite = InviteR1;

#[derive(Debug, Serialize, Deserialize)]
pub enum InviteDBEntry {
    InviteR1 (InviteR1),
    // InviteR2 (InviteR2),
    // InviteR3 (InviteR3),
}

impl From<InviteDBEntry> for Invite {
    fn from(entry: InviteDBEntry) -> Self {
        match entry {
            InviteDBEntry::InviteR1(invite) => invite.into(),
            // InviteDBEntry::InviteR2(invite) => invite.into(),
            // InviteDBEntry::InviteR3(invite) => invite.into(),
        }
    }
}

impl From<Invite> for InviteDBEntry {
    fn from(invite: Invite) -> Self {
        InviteDBEntry::InviteR1(invite)
    }
}

impl TryFrom<sled::IVec> for Invite {
    type Error = crate::Error;

    fn try_from(iv_vec: sled::IVec) -> crate::Result<Self> {
        serde_cbor::from_slice(iv_vec.as_ref())
            .chain_err(|| "Unable to deserialize invite")
            .map(|entry: InviteDBEntry| entry.into())
    }
}
