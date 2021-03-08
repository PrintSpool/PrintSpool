use eyre::{
    eyre,
    Result,
    // Context as _,
};
use serde::de::DeserializeOwned;

pub fn validate_model<M: validator::Validate + DeserializeOwned>(
    json: serde_json::Value,
) -> Result<M> {
    let next_model: M = serde_json::from_value(json)?;

    next_model.validate().map_err(|err| {
        let err_string = err.field_errors()
            .into_iter()
            .flat_map(|(field_name, err_list)| {
                err_list
                    .into_iter()
                    .map(|e2| {
                        e2.message
                            .as_ref()
                            .map(|s| s.to_string())
                            .unwrap_or_else(|| {
                                format!("{} is invalid (Error Code: {})", field_name, e2.code)
                            })
                    })
                    .collect::<Vec<_>>()
            })
            .map(|msg| msg.to_string())
            .collect::<Vec<String>>()
            .join("\n");
        eyre!(err_string)
    })?;

    Ok(next_model)
}
