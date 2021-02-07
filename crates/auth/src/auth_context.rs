use std::{sync::atomic::{ AtomicU64, Ordering }};
use eyre::{
    eyre,
    Result,
    // Context as _,
};

use crate::user::User;

static NEXT_ID: AtomicU64 = AtomicU64::new(0);

#[derive(Debug)]
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

    pub async fn local_http_auth(
        db: &crate::Db,
    ) -> Result<Self> {
        let user = User::get_local_http_user(db).await?;

        let auth = Self::new(Some(user));

        Ok(auth)
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
            Err(eyre!("Unauthorized"))
        }
    }

    pub fn allow_unauthorized_user(&self) -> Result<&User> {
        self.current_user
            .as_ref()
            .ok_or_else(||
                eyre!("Not authorized. Required firebase_id missing from connection init.")
            )
    }

    pub fn require_authorized_user(&self) -> Result<&User> {
        let user = self.allow_unauthorized_user()?;

        if !user.is_authorized {
            Err(
                eyre!("Unauthorized. Please log in and try again.")
            )
        } else {
            Ok(user)
        }
    }
}
