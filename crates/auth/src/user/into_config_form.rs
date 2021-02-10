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

use crate::user::{User, UserConfig};

impl From<&User> for Result<ConfigForm> {
    fn from(user: &User) -> Result<ConfigForm> {
        let mut root_schema = schema_for!(UserConfig);

        let form = root_schema.schema.object().properties
            .keys()
            .map(|k| k.clone())
            .collect();

        Ok(ConfigForm {
            id: format!("user-{}", user.id).into(),
            model: serde_json::to_value(&user.config)?.into(),
            model_version: user.version,
            schema_form: JsonSchemaForm {
                id: (&user.id).into(),
                schema: serde_json::to_value(root_schema)?.into(),
                form,
            },
        })
    }
}
