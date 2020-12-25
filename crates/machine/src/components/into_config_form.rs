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
use crate::components::ComponentInner;


impl<T, U> From<&ComponentInner<T, U>> for Result<ConfigForm>
where
    T: JsonSchema + Serialize,
    U: Default,
{
    fn from(component: &ComponentInner<T, U>) -> Result<ConfigForm> {
        let mut root_schema = schemars::schema_for!(T);

        let form = root_schema.schema.object().properties
            .keys()
            .map(|k| k.clone())
            .collect();

        Ok(ConfigForm {
            id: component.id.into(),
            model: serde_json::to_value(&component.model)?.into(),
            model_version: component.model_version,
            schema_form: JsonSchemaForm {
                id: component.id.into(),
                schema: serde_json::to_value(root_schema)?.into(),
                form,
            },
        })
    }
}
