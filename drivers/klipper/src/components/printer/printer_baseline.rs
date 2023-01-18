use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct PrinterBaselineConfig {
    pub klipper_id: String,
    /// Maximum velocity (in mm/s) of the toolhead (relative to the
    /// print). This parameter must be specified.
    pub max_velocity: f64,
    /// Maximum acceleration (in mm/s^2) of the toolhead (relative to the
    /// print). This parameter must be specified.
    pub max_accel: f64,
    /// A pseudo acceleration (in mm/s^2) controlling how fast the
    /// toolhead may go from acceleration to deceleration. It is used to
    /// reduce the top speed of short zig-zag moves (and thus reduce
    /// printer vibration from these moves). The default is half of
    /// max_accel.
    pub max_accel_to_decel: Option<f64>,
    /// The maximum velocity (in mm/s) that the toolhead may travel a 90
    /// degree corner at. A non-zero value can reduce changes in extruder
    /// flow rates by enabling instantaneous velocity changes of the
    /// toolhead during cornering. This value configures the internal
    /// centripetal velocity cornering algorithm; corners with angles
    /// larger than 90 degrees will have a higher cornering velocity while
    /// corners with angles less than 90 degrees will have a lower
    /// cornering velocity. If this is set to zero then the toolhead will
    /// decelerate to zero at each corner. The default is 5mm/s.
    pub square_corner_velocity: Option<f64>,
}
