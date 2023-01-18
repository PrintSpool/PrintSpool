use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct BedTilt {
    /// The amount to add to each move's Z height for each mm on the X
    /// axis. The default is 0.
    pub x_adjust: Option<f64>,
    /// The amount to add to each move's Z height for each mm on the Y
    /// axis. The default is 0.
    pub y_adjust: Option<f64>,
    /// The amount to add to the Z height when the nozzle is nominally at
    /// 0, 0. The default is 0.
    /// The remaining parameters control a BED_TILT_CALIBRATE extended
    /// g-code command that may be used to calibrate appropriate x and y
    /// adjustment parameters.
    pub z_adjust: Option<f64>,
    /// A list of X, Y coordinates (one per line; subsequent lines
    /// indented) that should be probed during a BED_TILT_CALIBRATE
    /// command. Specify coordinates of the nozzle and be sure the probe
    /// is above the bed at the given nozzle coordinates. The default is
    /// to not enable the command.
    pub points: Option<f64>,
    /// The speed (in mm/s) of non-probing moves during the calibration.
    /// The default is 50.
    pub speed: Option<f64>,
    /// The height (in mm) that the head should be commanded to move to
    /// just prior to starting a probe operation. The default is 5.
    pub horizontal_move_z: Option<f64>,
}
