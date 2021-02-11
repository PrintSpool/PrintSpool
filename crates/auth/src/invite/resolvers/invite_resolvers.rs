use chrono::prelude::*;
use async_graphql::{
    FieldResult,
    ID,
};
use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use teg_config_form::ConfigForm;

use crate::invite::Invite;

#[async_graphql::Object]
impl Invite {
    async fn id(&self) -> ID {
        (&self.id).into()
    }

    async fn description(&self) -> String {
        self.config.name
            .clone()
            .unwrap_or_else(|| format!("Invite #{}", self.id).to_string())
    }

    async fn is_admin(&self) -> bool {
        self.config.is_admin
    }
    async fn created_at(&self) -> DateTime<Utc> {
        self.created_at
    }

    async fn config_form(&self) -> FieldResult<ConfigForm> {
        let config_form: Result<ConfigForm> = self.into();
        Ok(config_form?)
    }
}
