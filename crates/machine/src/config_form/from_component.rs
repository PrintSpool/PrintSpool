use serde::Serialize;
use schemars::JsonSchema;
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use super::{
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
        let rootSchema = schemars::schema_for!(T);

        let form = rootSchema.schema.object().properties
            .keys()
            .map(|k| k.clone())
            .collect();

        Ok(ConfigForm {
            id: component.id.into(),
            model: serde_json::to_value(component.model)?.into(),
            model_version: component.model_version,
            schemaForm: JsonSchemaForm {
                id: component.id.into(),
                schema: serde_json::to_value(rootSchema)?.into(),
                form,
            },
        })
    }
}

// impl<T, U> From<&ComponentInner<T, U>> for Result<ConfigForm>
// where
//     U: Default,
// {
//     fn from(component: &ComponentInner<T, U>) -> Result<ConfigForm> {
//         Err(anyhow!("wat"))
//     }
// }
