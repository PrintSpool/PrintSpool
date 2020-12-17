use serde::{Deserialize, Serialize};

use super::ComponentInner;
use super::HeaterEphemeral;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ToolheadConfig {
    pub address: String,
    pub heater: bool,
    pub feedrate: f32,
    #[serde(rename = "materialID")]
    pub material_id: String,
}

pub type Toolhead = ComponentInner<ToolheadConfig, HeaterEphemeral>;
