// use serde::Serialize;
// use schemars::JsonSchema;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use teg_config_form::{
    ConfigForm,
    JsonSchemaForm,
};
use super::MachineConfig;


impl From<&MachineConfig> for Result<ConfigForm> {
    fn from(machine: &MachineConfig) -> Result<ConfigForm> {
        // Machines only have empty schema placeholders for now
        let root_schema = serde_json::json!({
            "type": "object"
        });

        let form = vec![];

        Ok(ConfigForm {
            id: format!("machine-{}", machine.id).into(),
            model: async_graphql::Json(serde_json::json!({})),
            model_version: 0,
            schema_form: JsonSchemaForm {
                id: machine.id.into(),
                schema: serde_json::to_value(root_schema)?.into(),
                form,
            },
        })
    }
}
