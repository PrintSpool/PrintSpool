use async_graphql::*;
use std::sync::Arc;

use anyhow::{
    anyhow,
    Result,
    Context as _,
};
use xactor::{
    Actor,
    Addr,
};
use arc_swap::ArcSwap;
use std::collections::HashMap;

use crate::models::User;
use crate::configuration::Config;
use crate::models::VersionedModel;
use crate::machine::models::{
    Machine,
    EphemeralMachineData,
};

pub struct Context {
    pub db: Arc<sled::Db>,
    pub current_user: Option<User>,
    pub session_id: Option<String>,
    pub identity_public_key: Option<String>,
    pub auth_pem_keys: ArcSwap<Vec<Vec<u8>>>,
    pub machine_config: Arc<ArcSwap<Config>>,
    pub ephemeral_machine_data: HashMap<u64, Addr<EphemeralMachineData>>,
}

impl Context {
    pub async fn new(
        db: Arc<sled::Db>,
        current_user_id: Option<ID>,
        identity_public_key: Option<String>,
        auth_pem_keys: ArcSwap<Vec<Vec<u8>>>,
        machine_config: Arc<ArcSwap<Config>>,
    ) -> Result<Self> {
        let mut ephemeral_machine_data = HashMap::new();
        let config_id = &machine_config.load().id;
        let machine_id = Machine::find(&db, |machine|
            &machine.config_id == config_id
        )?.id;

        let ephemeral_machine = EphemeralMachineData::new(
            machine_id,
            Arc::clone(&db),
        ).start().await?;
        ephemeral_machine_data.insert(machine_id, ephemeral_machine);

        let mut ctx = Self {
            db,
            current_user: None,
            session_id: None,
            identity_public_key,
            auth_pem_keys,
            machine_config,
            ephemeral_machine_data,
        };

        if let Some(current_user_id) = current_user_id {
            let current_user_id = current_user_id.parse()
                .with_context(|| format!("Invalid user id: {:?}", current_user_id))?;

            ctx.current_user  = Some(User::get(&ctx.db, current_user_id)?);
        }

        Ok(ctx)
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
