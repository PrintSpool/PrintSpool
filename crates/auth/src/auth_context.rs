use std::{sync::atomic::{ AtomicU64, Ordering }};
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use crate::user::User;

static NEXT_ID: AtomicU64 = AtomicU64::new(0);

pub struct AuthContext {
    pub current_user: Option<User>,
    pub session_id: u64,
}

impl AuthContext {
    pub fn new(
        current_user: Option<User>,
    ) -> Self {
        Self {
            current_user,
            session_id: NEXT_ID.fetch_add(1, Ordering::SeqCst),
        }
    }

    pub fn is_admin(&self) -> bool {
        self.current_user
            .as_ref()
            .map(|user| user.config.is_admin)
            .unwrap_or(false)
    }

    pub fn authorize_admins_only(&self) -> Result<()> {
        if self.is_admin() {
            Ok(())
        } else  {
            Err(anyhow!("Unauthorized"))
        }
    }

    pub fn require_user(&self) -> Result<&User> {
        self.current_user
            .as_ref()
            .ok_or_else(|| anyhow!("Unauthorized"))
    }
}
