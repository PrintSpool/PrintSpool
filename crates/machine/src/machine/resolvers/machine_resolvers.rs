use chrono::prelude::*;
use async_graphql::{
    ID,
    Context,
    FieldResult,
};
use eyre::{
    eyre,
    Result,
    Context as _,
};
use teg_config_form::ConfigForm;
use teg_auth::user::User;

use crate::{machine::{
    MachineData,
    MachineStatusGQL,
    MachineStatus,
}};
use crate::components::{
    Component
};
use crate::plugins::Plugin;
use crate::machine::GCodeHistoryEntry;
use super::machine_error_resolvers::MachineError;

#[derive(async_graphql::InputObject, Debug, Default)]
struct MachineComponentsInput {
    /// Optional filter: Return the machine by id
    #[graphql(name="componentID")]
    component_id: Option<async_graphql::ID>,
}

#[async_graphql::Object(name = "Machine")]
impl MachineData {
    async fn id(&self) -> ID {
        (&self.config.id).into()
    }

    async fn name(&self) -> FieldResult<String> {
        Ok(self.config.name()?)
    }

    async fn status(&self) -> MachineStatusGQL { self.status.clone().into() }
    async fn paused(&self) -> bool { self.status.is_paused() }

    /// The machine configuration for general settings.
    async fn config_form(&self) -> FieldResult<ConfigForm> {
        let core_plugin = self.config.core_plugin()?;
        let config_form = teg_config_form::into_config_form(core_plugin)?;
        Ok(config_form)
    }

    #[graphql(name = "components")]
    async fn _components(
        &self,
        #[graphql(default)]
        input: MachineComponentsInput,
    ) -> FieldResult<Vec<Component>> {
        let mut components = self.config.components().into_iter();

        let components = if let Some(component_id) = input.component_id {
            let component = components
                .find(|(id, _)| **id == component_id.to_string())
                .ok_or_else(|| eyre!("Component ({:?}) not found", component_id))?
                .1;

            vec![component]
        } else {
            components
                .map(|(_, c)| c)
                .collect()
        };

        Ok(components)
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
                    AND machine_viewers.expires_at >= ?
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
