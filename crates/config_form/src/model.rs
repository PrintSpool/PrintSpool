use serde::{
    Serialize,
    de::DeserializeOwned,
};
use schemars::JsonSchema;

pub trait Model: JsonSchema + Serialize + DeserializeOwned {
    fn form(all_fields: &Vec<String>) -> Vec<String>;
}
