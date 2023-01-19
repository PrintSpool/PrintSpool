use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::{
    printer::PrinterBaselineConfig, GenericStepper, KlipperPin, PositionedStepperBaselineConfig,
};

/// Linear Delta Kinematics
#[derive(Serialize, Deserialize, JsonSchema, Validate, Debug, Clone)]
pub struct DeltaPrinter {
    #[validate]
    #[serde(flatten)]
    pub baseline_config: PrinterBaselineConfig,
    /// For delta printers this limits the maximum velocity (in mm/s) of
    /// moves with z axis movement. This setting can be used to reduce the
    /// maximum speed of up/down moves (which require a higher step rate
    /// than other moves on a delta printer). The default is to use
    /// max_velocity for max_z_velocity.
    pub max_z_velocity: f64,
    /// This sets the maximum acceleration (in mm/s^2) of movement along
    /// the z axis. Setting this may be useful if the printer can reach higher
    /// acceleration on XY moves than Z moves (eg, when using input shaper).
    /// The default is to use max_accel for max_z_accel.
    pub max_z_accel: Option<f64>,
    /// The minimum Z position that the user may command the head to move
    /// to. The default is 0.
    pub minimum_z_position: Option<f64>,
    /// Radius (in mm) of the horizontal circle formed by the three linear
    /// axis towers. This parameter may also be calculated as:
    ///  delta_radius = smooth_rod_offset - effector_offset - carriage_offset
    /// This parameter must be provided.
    pub delta_radius: f64,
    /// The radius (in mm) of valid toolhead XY coordinates. One may use
    /// this setting to customize the range checking of toolhead moves. If
    /// a large value is specified here then it may be possible to command
    /// the toolhead into a collision with a tower. The default is to use
    /// delta_radius for print_radius (which would normally prevent a
    /// tower collision).
    pub print_radius: f64,
    /// The stepper_a section describes the stepper controlling the front
    /// left tower (at 210 degrees). This section also controls the homing
    /// parameters (homing_speed, homing_retract_dist) for all towers.
    pub stepper_a: DeltaStepperA,
    /// The stepper_b section describes the stepper controlling the front
    /// right tower (at 330 degrees).
    pub stepper_b: GenericStepper,
    /// The stepper_c section describes the stepper controlling the rear
    /// tower (at 90 degrees).
    pub stepper_c: GenericStepper,
    /// The delta_calibrate section enables a DELTA_CALIBRATE extended
    /// g-code command that can calibrate the tower endstop positions and
    /// angles.
    pub delta_calibrate: Option<DeltaCalibrate>,
}

#[derive(Serialize, Deserialize, JsonSchema, Validate, Debug, Clone)]
pub struct DeltaStepperA {
    #[validate]
    #[serde(flatten)]
    pub baseline_config: PositionedStepperBaselineConfig,
    /// Endstop switch detection pin. If this endstop pin is on a
    /// different mcu than the stepper motor then it enables "multi-mcu
    /// homing". This parameter must be provided for the X, Y, and Z
    /// steppers on cartesian style printers.
    pub endstop_pin: Option<KlipperPin>,
    /// Distance (in mm) between the nozzle and the bed when the nozzle is
    /// in the center of the build area and the endstop triggers. This
    /// parameter must be provided for stepper_a; for stepper_b and
    /// stepper_c this parameter defaults to the value specified for
    /// stepper_a.
    pub position_endstop: f64,
    /// Maximum valid distance (in mm) the user may command the stepper to
    /// move to. This parameter must be provided for the X, Y, and Z
    /// steppers on cartesian style printers.
    pub position_max: Option<f64>,
    /// Length (in mm) of the diagonal rod that connects this tower to the
    /// print head. This parameter must be provided for stepper_a; for
    /// stepper_b and stepper_c this parameter defaults to the value
    /// specified for stepper_a.
    pub arm_length: f64,
    /// This option specifies the angle (in degrees) that the tower is
    /// at. The default is 210 for stepper_a, 330 for stepper_b, and 90
    /// for stepper_c.
    pub angle: f64,
}

/// Linear Delta Kinematics
#[derive(Serialize, Deserialize, JsonSchema, Validate, Debug, Clone)]
pub struct DeltaCalibrate {
    /// Radius (in mm) of the area that may be probed. This is the radius
    /// of nozzle coordinates to be probed; if using an automatic probe
    /// with an XY offset then choose a radius small enough so that the
    /// probe always fits over the bed. This parameter must be provided.
    pub radius: f64,
    /// The speed (in mm/s) of non-probing moves during the calibration.
    /// The default is 50.
    pub speed: f64,
    /// The height (in mm) that the head should be commanded to move to
    /// just prior to starting a probe operation. The default is 5.
    pub horizontal_move_z: f64,
}
