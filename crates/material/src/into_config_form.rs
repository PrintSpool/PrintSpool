use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use schemars::schema_for;
use teg_config_form::{
    ConfigForm,
    JsonSchemaForm,
};

use crate::{FdmFilament, Material, MaterialConfigEnum};

impl From<&Material> for Result<ConfigForm> {
    fn from(material: &Material) -> Result<ConfigForm> {
        let mut root_schema = match material.config {
            MaterialConfigEnum::FdmFilament(_) => schema_for!(FdmFilament),
        };

        let form = root_schema.schema.object().properties
            .keys()
            .map(|k| k.clone())
            .collect();

        let model = match &material.config {
            MaterialConfigEnum::FdmFilament(m) => {
                serde_json::to_value(m)?.into()
            }
        };

        Ok(ConfigForm {
            id: format!("material-{}", material.id).into(),
            model,
            model_version: material.version,
            schema_form: JsonSchemaForm {
                id: (&material.id).into(),
                schema: serde_json::to_value(root_schema)?.into(),
                form,
            },
        })
    }
}
