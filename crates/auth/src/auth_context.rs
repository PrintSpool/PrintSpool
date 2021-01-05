use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use crate::user::User;

pub struct AuthContext {
    pub current_user: Option<User>,
    pub session_id: Option<String>,
    pub identity_public_key: Option<String>,
}

impl AuthContext {
    pub async fn new(
        db: &crate::Db,
        current_user_id: Option<crate::DbId>,
        identity_public_key: Option<String>,
    ) -> Result<Self> {
        let mut ctx = Self {
            current_user: None,
            session_id: None,
            identity_public_key,
        };

        if let Some(current_user_id) = current_user_id {
            let user = User::get(db, current_user_id).await?;
            ctx.current_user  = Some(user);
        }

        Ok(ctx)
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

    pub fn require_session_id(&self) -> Result<&String> {
        self.session_id
            .as_ref()
            .ok_or_else(|| anyhow!("Unauthorized"))
    }
}
