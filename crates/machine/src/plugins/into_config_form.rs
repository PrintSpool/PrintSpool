use serde::Serialize;
use schemars::JsonSchema;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use teg_config_form::{
    ConfigForm,
    JsonSchemaForm,
};

use super::PluginContainer;


impl<T> From<&PluginContainer<T>> for Result<ConfigForm>
where
    T: JsonSchema + Serialize,
{
    fn from(plugin: &PluginContainer<T>) -> Result<ConfigForm> {
        let mut root_schema = schemars::schema_for!(T);

        let form = root_schema.schema.object().properties
            .keys()
            .map(|k| k.clone())
            .collect();

        Ok(ConfigForm {
            id: (&plugin.id).into(),
            model: serde_json::to_value(&plugin.model)?.into(),
            model_version: plugin.model_version,
            schema_form: JsonSchemaForm {
                id: (&plugin.id).into(),
                schema: serde_json::to_value(root_schema)?.into(),
                form,
            },
        })
    }
}
