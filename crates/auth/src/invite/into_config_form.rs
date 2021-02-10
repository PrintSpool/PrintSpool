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

use crate::invite::{Invite, InviteConfig};

impl From<&Invite> for Result<ConfigForm> {
    fn from(invite: &Invite) -> Result<ConfigForm> {
        let mut root_schema = schema_for!(InviteConfig);

        let form = root_schema.schema.object().properties
            .keys()
            .map(|k| k.clone())
            .collect();

        Ok(ConfigForm {
            id: format!("invite-{}", invite.id).into(),
            model: serde_json::to_value(&invite.config)?.into(),
            model_version: invite.version,
            schema_form: JsonSchemaForm {
                id: (&invite.id).into(),
                schema: serde_json::to_value(root_schema)?.into(),
                form,
            },
        })
    }
}
