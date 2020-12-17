use serde::{Deserialize, Serialize};

use super::ComponentInner;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VideoConfig {
    pub name: String,
    pub source: String,
}

pub type Video = ComponentInner<VideoConfig, ()>;
