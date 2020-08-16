use serde::{Deserialize, Serialize};
use versioned_sled_model::VersionedSledModel;

mod invite_r1;
pub use invite_r1::InviteR1;

// mod invite_r2;
// pub use invite_r2::InviteR2;

// mod invite_r3;
// pub use invite_r3::InviteR3;

pub type Invite = InviteR1;

#[derive(Debug, Serialize, Deserialize, VersionedSledModel)]
pub enum InviteDBEntry {
    InviteR1 (InviteR1),
    // InviteR2 (InviteR2),
    // InviteR3 (InviteR3),
}

impl crate::models::VersionedModel for Invite {
    type Entry = InviteDBEntry;
    const NAMESPACE: &'static str = "Invite";

    fn get_id(&self) -> u64 {
        self.id
    }
}
