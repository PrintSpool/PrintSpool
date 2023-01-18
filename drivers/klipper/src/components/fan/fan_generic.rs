use crate::KlipperId;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use super::Fan;

/// Manually controlled fan (one may define any number of sections with a
/// "fan_generic" prefix). The speed of a manually controlled fan is set
/// with the SET_FAN_SPEED [gcode command](https://github.com/Klipper3d/klipper/blob/master/docs/G-Codes.md#fan_generic).
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct FanGeneric {
    pub klipper_id: KlipperId,

    #[serde(flatten)]
    pub baseline_config: Fan,
}
