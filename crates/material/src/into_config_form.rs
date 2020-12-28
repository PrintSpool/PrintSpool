use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
use teg_config_form::{
    ConfigForm,
    JsonSchemaForm,
};

use crate::{
    Material,
    MaterialConfigEnum,
};

impl From<&Material> for Result<ConfigForm> {
    fn from(material: &Material) -> Result<ConfigForm> {
        let mut root_schema = schemars::schema_for!(MaterialConfigEnum);

        let form = root_schema.schema.object().properties
            .keys()
            .map(|k| k.clone())
            .collect();

        Ok(ConfigForm {
            id: format!("material-{}", material.id).into(),
            model: serde_json::to_value(&material.config)?.into(),
            model_version: material.version,
            schema_form: JsonSchemaForm {
                id: material.id.into(),
                schema: serde_json::to_value(root_schema)?.into(),
                form,
            },
        })
    }
}
