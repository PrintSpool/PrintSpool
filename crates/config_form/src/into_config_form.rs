use eyre::{
    // eyre,
    Result,
    // Context as _,
};

use crate::{ ConfigForm, Configurable };

fn introspect_model<M>() -> Result<(
    async_graphql::Json<serde_json::Value>,
    Vec<String>,
    Vec<String>,
)>
where
    M: crate::Model,
{
    let mut root_schema = schemars::schema_for!(M);

    let all_fields = root_schema.schema.object().properties
        .keys()
        .map(|k| k.clone())
        .collect::<Vec<_>>();

    let form = M::form(&all_fields)
        .into_iter()
        .map(|s| s.to_string())
        .collect::<Vec<_>>();

    // The `advanced_form` is generated from all fields not in the `form`
    let advanced_form = all_fields
        .into_iter()
        .filter(|k| form.iter().all(|k2| k2 != k))
        .collect::<Vec<_>>();

    Ok((
        serde_json::to_value(root_schema)?.into(),
        form,
        advanced_form,
    ))
}

/// A form for updating the existing instance of model type M
pub fn into_config_form<C, M>(config: &C) -> Result<ConfigForm>
where
    C: Configurable<M>,
    M: crate::Model,
{
    let (
        schema,
        form,
        advanced_form,
    ) = introspect_model::<M>()?;

    Ok(ConfigForm {
        id: config.id(),
        model: serde_json::to_value(config.model())?.into(),
        model_version: config.model_version(),
        schema,
        form,
        advanced_form,
    })
}

/// A form for creating a new instance of model type M
pub fn create_form<M>(id: String) -> Result<ConfigForm>
where
    M: crate::Model,
{
    let (
        schema,
        form,
        advanced_form,
    ) = introspect_model::<M>()?;

    Ok(ConfigForm {
        id: id.into(),
        model: serde_json::json!({}).into(),
        model_version: 0,
        schema,
        form,
        advanced_form,
    })
}
