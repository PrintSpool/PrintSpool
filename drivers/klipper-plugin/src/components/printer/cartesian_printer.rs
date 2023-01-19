use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::{printer::PrinterBaselineConfig, KlipperPin, PositionedStepperBaselineConfig};

/// Cartesian Kinematics
#[derive(Serialize, Deserialize, JsonSchema, Validate, Debug, Clone)]
pub struct CartesianPrinter {
    #[validate]
    #[serde(flatten)]
    pub baseline_config: PrinterBaselineConfig,
    /// This sets the maximum velocity (in mm/s) of movement along the z
    /// axis. This setting can be used to restrict the maximum speed of
    /// the z stepper motor. The default is to use max_velocity for
    /// max_z_velocity.
    pub max_z_velocity: f64,
    /// This sets the maximum acceleration (in mm/s^2) of movement along
    /// the z axis. It limits the acceleration of the z stepper motor. The
    /// default is to use max_accel for max_z_accel.
    pub max_z_accel: Option<f64>,

    /// e stepper_x section is used to describe the stepper controlling
    /// e X axis in a cartesian robot.
    #[validate]
    pub stepper_x: CartesianStepper,

    /// e stepper_y section is used to describe the stepper controlling
    /// e Y axis in a cartesian robot.
    #[validate]
    pub stepper_y: CartesianStepper,

    /// e stepper_z section is used to describe the stepper controlling
    /// e Z axis in a cartesian robot.
    #[validate]
    pub stepper_z: CartesianStepper,
}

#[derive(Serialize, Deserialize, JsonSchema, Validate, Debug, Clone)]
pub struct CartesianStepper {
    #[validate]
    #[serde(flatten)]
    pub baseline_config: PositionedStepperBaselineConfig,
    /// Endstop switch detection pin. If this endstop pin is on a
    /// different mcu than the stepper motor then it enables "multi-mcu
    /// homing". This parameter must be provided for the X, Y, and Z
    /// steppers on cartesian style printers.
    pub endstop_pin: KlipperPin,
    /// Location of the endstop (in mm). This parameter must be provided
    /// for the X, Y, and Z steppers on cartesian style printers.
    pub position_endstop: f64,
    /// Maximum valid distance (in mm) the user may command the stepper to
    /// move to. This parameter must be provided for the X, Y, and Z
    /// steppers on cartesian style printers.
    pub position_max: f64,
}
