use async_graphql::{
    ID,
    FieldResult,
    // Context,
};
use schemars::{
    // schema::RootSchema,
    schema_for,
    JsonSchema,
};
use teg_auth::invite::InviteConfig;
use teg_config_form::ConfigForm;
use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use teg_material::{FdmFilament, MaterialTypeGQL};

use crate::{
    components::{
        ComponentTypeGQL,
        ControllerConfig,
        AxisConfig,
        ToolheadConfig,
        SpeedControllerConfig,
        VideoConfig,
        BuildPlatformConfig,
    },
    config::CombinedConfigView,
    // plugins::core::CorePluginConfig
};

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
//     pub config_form_key: String,

//     /// machineID is required for PLUGIN and COMPONENT ConfigCollection config forms
//     #[graphql(name = "machineID")]
//     pub machine_id: Option<ID>,
//     pub model: async_graphql::Json<serde_json::Value>,
// }

#[derive(async_graphql::InputObject, Debug)]
struct ComponentSchemaFormInput {
    // Require machine ID so that in future different machines may have different schemas
    #[graphql(name = "machineID")]
    pub machine_id: ID,
    r#type: ComponentTypeGQL,
}

#[derive(async_graphql::InputObject, Debug)]
struct MaterialSchemaFormInput {
    r#type: MaterialTypeGQL,
}

// #[derive(async_graphql::InputObject, Debug)]
// struct PluginSchemaFormInput {
//     #[graphql(name = "machineID")]
//     pub machine_id: ID,
//     package: String,
// }

#[async_graphql::Object]
impl ConfigQuery {
    #[instrument(skip(self))]
    async fn machine_config_form<'ctx>(
        &self,
    ) -> FieldResult<ConfigForm> {
        let config_form = to_config_form::<CombinedConfigView>("machine".into())?;

        Ok(config_form)
    }

    #[instrument(skip(self))]
    async fn invite_config_form<'ctx>(
        &self,
    ) -> FieldResult<ConfigForm> {
        let config_form = to_config_form::<InviteConfig>("invite".into())?;

        Ok(config_form)
    }

    #[instrument(skip(self))]
    async fn user_config_form<'ctx>(
        &self,
    ) -> FieldResult<ConfigForm> {
        let config_form = to_config_form::<InviteConfig>("user".into())?;

        Ok(config_form)
    }

    #[instrument(skip(self))]
    async fn material_config_form<'ctx>(
        &self,
        input: MaterialSchemaFormInput,
    ) -> FieldResult<ConfigForm> {
        let config_form = match input.r#type {
            MaterialTypeGQL::FdmFilament => to_config_form::<FdmFilament>("FdmFilament".into()),
        }?;

        Ok(config_form)
    }

    // #[instrument(skip(self))]
    // async fn plugin_config_form<'ctx>(
    //     &self,
    //     input: PluginSchemaFormInput,
    // ) -> FieldResult<ConfigForm> {
    //     if &input.package[..] != "teg-core" {
    //         Err(eyre!("Plugin not found: {}", input.package))?
    //     }

    //     let config_form = to_config_form::<schema_for>(
    //         CorePluginConfig
    //     ))?;

    //     Ok(config_form)
    // }

    #[instrument(skip(self))]
    async fn component_config_form<'ctx>(
        &self,
        input: ComponentSchemaFormInput,
    ) -> FieldResult<ConfigForm> {
        use ComponentTypeGQL::*;

        let config_form = match input.r#type {
            Controller => to_config_form::<ControllerConfig>("Controller".into()),
            Axis => to_config_form::<AxisConfig>("Axis".into()),
            Toolhead => to_config_form::<ToolheadConfig>("Toolhead".into()),
            SpeedController => to_config_form::<SpeedControllerConfig>("SpeedController".into()),
            Video => to_config_form::<VideoConfig>("Video".into()),
            BuildPlatform => to_config_form::<BuildPlatformConfig>("BuildPlatform".into()),
        }?;

        Ok(config_form)
    }
}

pub fn to_config_form<C: JsonSchema>(
    id: String,
) -> Result<ConfigForm> {
    let mut root_schema = schema_for!(C);

    let form = root_schema.schema.object().properties
        .keys()
        .map(|k| k.clone())
        .collect();

    Ok(ConfigForm {
        id: id.into(),
        schema: serde_json::to_value(root_schema)?.into(),
        model: serde_json::json!({}).into(),
        model_version: 0i32,
        form,
        advanced_form: vec![],
    })
}

