use chrono::prelude::*;
use async_graphql::{
    ID,
    Context,
    FieldResult,
};
use eyre::{
    // eyre,
    Result,
    Context as _,
};
use teg_config_form::ConfigForm;
use teg_auth::user::User;

use crate::machine::{
    MachineData,
    MachineStatusGQL,
    MachineStatus,
};
use crate::components::{
    Component
};
use crate::plugins::Plugin;
use crate::machine::GCodeHistoryEntry;
use super::machine_error_resolvers::MachineError;

#[async_graphql::Object]
impl MachineData {
    async fn id(&self) -> ID {
        (&self.config.id).into()
    }

    async fn name(&self) -> FieldResult<String> {
        Ok(self.config.name()?)
    }

    async fn status(&self) -> MachineStatusGQL { self.status.clone().into() }
    async fn paused(&self) -> bool { self.paused_task_id.is_some() }

    /// The machine configuration for general settings.
    async fn config_form(&self) -> FieldResult<ConfigForm> {
        let config_form: Result<ConfigForm> = (&self.config).into();
        Ok(config_form?)
    }

    async fn components(&self) -> Vec<Component> {
        self.config.components()
    }

    async fn fixed_list_component_types(&self) -> FieldResult<Vec<String>> {
        Ok(vec![
            "CONTROLLER".into(),
            "AXIS".into(),
            "BUILD_PLATFORM".into(),
        ])
    }

    async fn plugins(&self, plugin_id: Option<String>) -> Vec<&Plugin> {
        if plugin_id.is_some() && plugin_id != Some("teg-core".into()) {
            return vec![]
        } else {
            self.config.plugins.iter().collect()
        }
    }

    async fn available_packages(&self) -> FieldResult<Vec<String>> {
        Ok(vec![])
    }

    // TODO: Viewers
    async fn viewers<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<User>> {
        let db: &crate::Db = ctx.data()?;

        struct JsonRow {
            pub props: String,
        }

        let now = Utc::now();

        let users: Vec<User> = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT DISTINCT users.props FROM users
                INNER JOIN machine_viewers ON machine_viewers.user_id = users.id
                WHERE
                    machine_viewers.machine_id = ?
                    AND machine_viewers.expires_at < ?
                ORDER BY users.id
            "#,
            self.config.id,
            now,
        )
            .fetch_all(db)
            .await?
            .into_iter()
            .map(|row| {
                serde_json::from_str(&row.props)
                    .with_context(|| "Corrupted user data found during machineViewers query")
            })
            .collect::<Result<_>>()?;

        Ok(users)
    }

    async fn swap_x_and_y_orientation(&self) -> FieldResult<bool> {
        let val = self.config.core_plugin()?.model.swap_x_and_y_orientation;
        Ok(val)
    }

    async fn motors_enabled(&self) -> bool { self.motors_enabled }

    async fn error(&self) -> Option<MachineError> {
        if let MachineStatus::Errored(error) = &self.status {
            Some(MachineError {
                code: "FIRMWARE_ERROR".to_string(),
                message: error.message.clone(),
            })
        } else {
            None
        }
     }

    async fn enabled_macros(&self) -> Vec<String> {
        vec![
            "home".into(),
            "setTargetTemperatures".into(),
            "toggleFans".into(),
            "toggleHeaters".into(),
            "toggleMotorsEnabled".into(),
            "continuousMove".into(),
            "moveBy".into(),
            "moveTo".into(),
        ]
    }

    async fn gcode_history(&self, limit: Option<usize>) -> Vec<&GCodeHistoryEntry> {
        let limit = limit.unwrap_or(self.gcode_history.len());

        self.gcode_history
            .iter()
            .take(limit)
            .collect()
    }
}
