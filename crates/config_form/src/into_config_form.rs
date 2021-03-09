use serde::Serialize;
use schemars::JsonSchema;
use eyre::{
    // eyre,
    Result,
    // Context as _,
};

use crate::{ ConfigForm, Configurable };

pub fn into_config_form<C, M>(config: &C) -> Result<ConfigForm>
where
    C: Configurable<M>,
    M: JsonSchema + Serialize,
{
    let mut root_schema = schemars::schema_for!(M);

    let all_fields = root_schema.schema.object().properties
        .keys()
        .map(|k| k.clone())
        .collect::<Vec<_>>();

    let form = C::form(&all_fields)
        .into_iter()
        .map(|s| s.to_string())
        .collect::<Vec<_>>();

    // The `advanced_form` is generated from all fields not in the `form`
    let advanced_form = all_fields
        .into_iter()
        .filter(|k| form.iter().all(|k2| k2 != k))
        .collect::<Vec<_>>();

    Ok(ConfigForm {
        id: config.id(),
        model: serde_json::to_value(config.model())?.into(),
        model_version: config.model_version(),
        schema: serde_json::to_value(root_schema)?.into(),
        form,
        advanced_form,
    })
}
