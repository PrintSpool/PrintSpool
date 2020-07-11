use async_graphql::*;
use anyhow::{anyhow, Result};
use std::sync::Arc;

use crate::models::User;
use async_std::sync::RwLock;
use crate::configuration::Config;
use crate::models::VersionedModel;

pub struct Context {
    pub db: Arc<sled::Db>,
    pub current_user: Option<User>,
    pub identity_public_key: Option<String>,
    pub auth_pem_keys: Arc<RwLock<Vec<Vec<u8>>>>,
    pub machine_config: Arc<RwLock<Config>>,
}

impl Context {
    pub async fn new(
        db: Arc<sled::Db>,
        current_user_id: Option<ID>,
        identity_public_key: Option<String>,
        auth_pem_keys: Arc<RwLock<Vec<Vec<u8>>>>,
        machine_config: Arc<RwLock<Config>>,
    ) -> Result<Self> {
        let mut context = Self {
            db,
            current_user: None,
            identity_public_key,
            auth_pem_keys,
            machine_config,
        };

        if let Some(current_user_id) = current_user_id {
            context.current_user  = Some(User::get(&current_user_id, &context.db).await?);
        }

        Ok(context)
    }

    pub fn is_admin(&self) -> bool {
        self.current_user
            .as_ref()
            .map(|user| user.is_admin)
            .unwrap_or(false)
    }

    pub fn authorize_admins_only(&self) -> Result<()> {
        if self.is_admin() {
            Ok(())
        } else  {
            Err(anyhow!("Unauthorized"))
        }
    }
}
