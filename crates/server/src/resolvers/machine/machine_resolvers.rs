use super::machine_error_resolvers::MachineError;
use crate::component::Component;
use crate::component::ComponentsByMachine;
use crate::machine::GCodeHistoryEntry;
use crate::machine::{Machine, MachineStatus, MachineStatusGQL};
// use crate::plugins::Plugin;
use crate::{Db, DbId, Deletion};
use async_graphql::{Context, FieldResult, ID};
use chrono::prelude::*;
use eyre::{eyre, Context as _, Result};
use printspool_auth::user::User;
use printspool_config_form::ConfigForm;

#[derive(Deref, DerefMut)]
pub struct MachineResolvers(Machine);

#[derive(async_graphql::InputObject, Debug, Default)]
struct MachineComponentsInput {
    /// Optional filter: Return the machine by id
    #[graphql(name = "componentID")]
    component_id: Option<async_graphql::ID>,
}

#[async_graphql::Object(name = "Machine")]
impl MachineResolvers {
    async fn id(&self) -> ID {
        (&self.config.id).into()
    }

    async fn name(&self) -> FieldResult<String> {
        Ok(self.config.name()?)
    }

    /// The machine configuration for general settings.
    async fn config_form(&self) -> FieldResult<ConfigForm> {
        let core_plugin = self.config.core_plugin()?;
        let config_form = printspool_config_form::into_config_form(core_plugin)?;
        Ok(config_form)
    }

    async fn components(
        &self,
        ctx: &Context<'_>,
        #[graphql(default)] input: MachineComponentsInput,
    ) -> FieldResult<Vec<Component>> {
        let db: Db = ctx.data()?;
        let components = ComponentsByMachine::entries(&db)
            .with_key_range((
                Deletion::None,
                self.id,
                DbId::or_any(input.component_id.try_into()?),
            ))
            .query_with_collection_docs()
            .await?
            .into_iter()
            .map(|m| m.document.contents)
            .collect::<Vec<_>>();

        if let Some(component_id) = input.component_id.and(components.empty()) {
            return Err(eyre!("Component ({:?}) not found", component_id));
        };

        Ok(components)
    }

    async fn fixed_list_component_types(&self) -> FieldResult<Vec<String>> {
        Ok(self.driver().fixed_list_component_types())
    }

    async fn developer_mode(&self) -> FieldResult<bool> {
        Ok(self.core_config.developer_mode)
    }

    // async fn plugins(&self, plugin_id: Option<String>) -> Vec<&Plugin> {
    //     vec![]
    // }

    // async fn available_packages(&self) -> FieldResult<Vec<String>> {
    //     Ok(vec![])
    // }

    async fn swap_x_and_y_orientation(&self) -> FieldResult<bool> {
        Ok(self.core_config.swap_x_and_y_orientation)
    }

    async fn infinite_z(&self) -> FieldResult<bool> {
        Ok(self.core_config.infinite_z)
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

    async fn status(&self, ctx: &Context<'_>) -> MachineStatusGQL {
        let state = self.load_state(ctx).await?;

        Ok(state.status.into())
    }
    async fn paused(&self, ctx: &Context<'_>) -> bool {
        let state = self.load_state(ctx).await?;

        Ok(state.status.is_paused())
    }

    async fn motors_enabled(&self, ctx: &Context<'_>) -> FieldResult<bool> {
        let state = self.load_state(ctx).await?;
        Ok(state.motors_enabled)
    }

    async fn error(&self, ctx: &Context<'_>) -> Option<MachineError> {
        let state = self.load_state(ctx).await?;

        if let MachineStatus::Errored(error) = &state.status {
            Some(MachineError {
                code: "FIRMWARE_ERROR".to_string(),
                message: error.message.clone(),
            })
        } else {
            None
        }
    }

    async fn gcode_history(
        &self,
        limit: Option<usize>,
        ctx: &Context<'_>,
    ) -> FieldResult<Vec<&GCodeHistoryEntry>> {
        let state = self.load_state(ctx).await?;

        let limit = limit.unwrap_or(self.gcode_history.len());
        Ok(state.gcode_history.iter().take(limit).collect())
    }

    async fn viewers<'ctx>(&self, ctx: &Context<'_>) -> FieldResult<Vec<User>> {
        let db: &Db = ctx.data()?;

        let now = Utc::now();

        let users: Vec<User> = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT result.props FROM (
                    SELECT DISTINCT users.id, users.props FROM users
                    INNER JOIN machine_viewers ON machine_viewers.user_id = users.id
                    WHERE
                        machine_viewers.machine_id = $1
                        AND machine_viewers.expires_at >= $2
                    ORDER BY users.id
                ) as result
            "#,
            self.config.id,
            now,
        )
        .fetch_all(db)
        .await?
        .into_iter()
        .map(|row| {
            User::from_row(row)
                .with_context(|| "Corrupted user data found during machineViewers query")
        })
        .collect::<Result<_>>()?;

        Ok(users)
    }
}
