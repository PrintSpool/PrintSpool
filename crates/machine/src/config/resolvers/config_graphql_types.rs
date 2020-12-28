use async_graphql::ID;

/// Each config model encapsulates configuration of AUTH, PLUGIN, COMPONENT or MATERIAL.
#[derive(async_graphql::Enum, Copy, Clone, Eq, PartialEq, Debug)]
pub enum ConfigCollection {
    AUTH,
    COMPONENT,
    MATERIAL,
    PLUGIN,
}

#[derive(async_graphql::InputObject, Debug)]
pub struct CreateConfigInput {
    pub collection: ConfigCollection,
    /// The schemaFormKey is dependent on the collection:
    /// - For collection = **"AUTH"** schemaFormKey should be the either "user" or "invite"
    /// - For collection = **"COMPONENT"** schemaFormKey should be the **component type** (eg. \`"CONTROLLER"\`)
    /// - For collection = **"MATERIAL"** schemaFormKey should be the **material type** (eg. \`"FDM_FILAMENT"\`)
    /// - For collection = **"PLUGIN"** schemaFormKey should be the **plugin name** (eg. \`"@tegapp/core"\`)
    pub schema_form_key: String,

    /// machineID is required for PLUGIN and COMPONENT ConfigCollection config forms
    #[graphql(name: "machineID")]
    pub machine_id: Option<ID>,
    pub model: async_graphql::Json<serde_json::Value>,
}


#[derive(async_graphql::InputObject, Debug)]
pub struct UpdateConfigInput {
    pub collection: ConfigCollection,
    /// machineID is required for PLUGIN and COMPONENT ConfigCollection config forms
    #[graphql(name: "machineID")]
    pub machine_id: Option<ID>,
    /// The id of the model to be updated
    pub config_form_id: ID,
    pub model_version: i32,
    pub model: async_graphql::Json<serde_json::Value>,
}

#[derive(async_graphql::InputObject, Debug)]
pub struct DeleteConfigInput {
    pub collection: ConfigCollection,
    /// machineID is required for PLUGIN and COMPONENT ConfigCollection config forms
    #[graphql(name: "machineID")]
    pub machine_id: Option<ID>,
    pub config_form_id: ID,
}


#[derive(async_graphql::InputObject, Debug)]
pub struct CreateMachineInput {
    pub model: async_graphql::Json<serde_json::Value>,
}

#[derive(async_graphql::InputObject, Debug)]
pub struct SetMaterialsInput {
    #[graphql(name: "machineID")]
    pub machine_id: ID,
    pub toolheads: Vec<SetMaterialsToolhead>,
}

#[derive(async_graphql::InputObject, Debug)]
pub struct SetMaterialsToolhead {
    pub id: ID,
    #[graphql(name: "machineID")]
    pub machine_id: ID,
}


#[derive(async_graphql::SimpleObject)]
pub struct SetConfigResponse {
    pub errors: Vec<JSONSchemaError>,
}

#[derive(async_graphql::SimpleObject)]
pub struct JSONSchemaError {
    /// The validation keyword.
    pub keyword: String,
    /// the path to the part of the data that was validated using
    /// the RFC6901 JSON pointer standard (e.g., "/prop/1/subProp").
    pub data_path: String,
    /// the path (JSON-pointer as a URI fragment) to the schema of the keyword that
    /// failed validation.
    pub schema_path: String,

    // TODO: Internationalization Support
    // /// the object with the additional information about error that can be used to
    // /// create custom error messages (e.g., using ajv-i18n package).
    // params:  async_graphql::Json<serde_json::Value>,

    /// the standard error message
    pub message: String,
  }

