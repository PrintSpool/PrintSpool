use async_graphql::{
    // ID,
    FieldResult,
    // Context,
};
use schemars::{
    schema::RootSchema,
    schema_for,
};
use teg_auth::invite::InviteConfig;
use teg_config_form::JsonSchemaForm;
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use teg_material::{FdmFilament, MaterialTypeGQL};

use crate::{components::{
        ComponentTypeGQL,
        ControllerConfig,
        AxisConfig,
        ToolheadConfig,
        SpeedControllerConfig,
        VideoConfig,
        BuildPlatformConfig,
    }, config::CombinedConfigView, plugins::core::CorePluginConfig};

#[derive(Default)]
pub struct ConfigQuery;


// #[derive(async_graphql::InputObject, Debug)]
// pub struct CreateConfigInput {
//     pub collection: cgt::ConfigCollection,
//     /// The schemaFormKey is dependent on the collection:
//     /// - For collection = **"AUTH"** schemaFormKey should be the either "user" or "invite"
//     /// - For collection = **"COMPONENT"** schemaFormKey should be the **component type** (eg. \`"CONTROLLER"\`)
//     /// - For collection = **"MATERIAL"** schemaFormKey should be the **material type** (eg. \`"FDM_FILAMENT"\`)
//     /// - For collection = **"PLUGIN"** schemaFormKey should be the **plugin name** (eg. \`"@tegapp/core"\`)
//     pub schema_form_key: String,

//     /// machineID is required for PLUGIN and COMPONENT ConfigCollection config forms
//     #[graphql(name = "machineID")]
//     pub machine_id: Option<ID>,
//     pub model: async_graphql::Json<serde_json::Value>,
// }

#[derive(async_graphql::InputObject, Debug)]
struct ComponentSchemaFormInput {
    r#type: ComponentTypeGQL,
}

#[derive(async_graphql::InputObject, Debug)]
struct MaterialSchemaFormInput {
    r#type: MaterialTypeGQL,
}

#[derive(async_graphql::InputObject, Debug)]
struct PluginSchemaFormInput {
    package: String,
}

#[async_graphql::Object]
impl ConfigQuery {
    #[instrument(skip(self))]
    async fn machine_schema_form<'ctx>(
        &self,
    ) -> FieldResult<JsonSchemaForm> {
        let schema_form = to_schema_form(schema_for!(
            CombinedConfigView
        ))?;
        Ok(schema_form)
    }

    #[instrument(skip(self))]
    async fn invite_schema_form<'ctx>(
        &self,
    ) -> FieldResult<JsonSchemaForm> {
        let schema_form = to_schema_form(schema_for!(
            InviteConfig
        ))?;
        Ok(schema_form)
    }

    #[instrument(skip(self))]
    async fn user_schema_form<'ctx>(
        &self,
    ) -> FieldResult<JsonSchemaForm> {
        let schema_form = to_schema_form(schema_for!(
            InviteConfig
        ))?;
        Ok(schema_form)
    }

    #[instrument(skip(self))]
    async fn material_schema_form<'ctx>(
        &self,
        input: MaterialSchemaFormInput,
    ) -> FieldResult<JsonSchemaForm> {
        let schema = match input.r#type {
            MaterialTypeGQL::FdmFilament => schema_for!(FdmFilament),
        };

        let schema_form = to_schema_form(schema)?;
        Ok(schema_form)
    }

    #[instrument(skip(self))]
    async fn plugin_schema_form<'ctx>(
        &self,
        input: PluginSchemaFormInput,
    ) -> FieldResult<JsonSchemaForm> {
        if &input.package[..] != "teg-core" {
            Err(eyre!("Plugin not found: {}", input.package))?
        }

        let schema_form = to_schema_form(schema_for!(
            CorePluginConfig
        ))?;

        Ok(schema_form)
    }

    #[instrument(skip(self))]
    async fn component_schema_form<'ctx>(
        &self,
        input: ComponentSchemaFormInput,
    ) -> FieldResult<JsonSchemaForm> {
        use ComponentTypeGQL::*;

        let schema = match input.r#type {
            Controller => schema_for!(ControllerConfig),
            Axis => schema_for!(AxisConfig),
            Toolhead => schema_for!(ToolheadConfig),
            SpeedController => schema_for!(SpeedControllerConfig),
            Video => schema_for!(VideoConfig),
            BuildPlatform => schema_for!(BuildPlatformConfig),
        };

        let schema_form = to_schema_form(schema)?;
        Ok(schema_form)
    }
}

pub fn to_schema_form(mut root_schema: RootSchema) -> Result<JsonSchemaForm> {
    let form = root_schema.schema.object().properties
        .keys()
        .map(|k| k.clone())
        .collect();

    Ok(JsonSchemaForm {
        id: "machine".into(),
        schema: serde_json::to_value(root_schema)?.into(),
        form,
    })
}
