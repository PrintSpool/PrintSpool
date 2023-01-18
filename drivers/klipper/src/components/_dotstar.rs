use crate::KlipperId;
use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Dotstar {
    pub klipper_id: KlipperId,
    /// The pin connected to the data line of the dotstar. This parameter
    /// must be provided.
    pub data_pin: KlipperPin,
    /// The pin connected to the clock line of the dotstar. This parameter
    /// must be provided.
    pub clock_pin: KlipperPin,
    /// See the "neopixel" section for information on this parameter.
    pub chain_count: Option<f64>,
    /// 
    pub initial_RED: Option<f64>,
    /// 
    pub initial_GREEN: Option<f64>,
    /// See the "led" section for information on these parameters.
    pub initial_BLUE: Option<f64>,
}
