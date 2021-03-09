use serde::{Serialize, Deserialize};
use nanoid::nanoid;

#[derive(new, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ComponentInner<M, E: Default> {
    #[new(value = "nanoid!(11)")]
    pub id: String,
    #[new(default)]
    pub model_version: teg_json_store::Version,
    pub model: M,
    #[serde(skip)]
    #[new(default)]
    pub ephemeral: E,
}
