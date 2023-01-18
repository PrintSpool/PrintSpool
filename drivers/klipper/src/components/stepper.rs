use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct StepperBaselineConfig {
    /// Step GPIO pin (triggered high). This parameter must be provided.
    pub step_pin: crate::KlipperPin,
    /// Direction GPIO pin (high indicates positive direction). This
    /// parameter must be provided.
    pub dir_pin: crate::KlipperPin,
    /// Enable pin (default is enable high; use ! to indicate enable
    /// low). If this parameter is not provided then the stepper motor
    /// driver must always be enabled.
    pub enable_pin: crate::KlipperPin,
    /// Distance (in mm) that the axis travels with one full rotation of
    /// the stepper motor (or final gear if gear_ratio is specified).
    /// This parameter must be provided.
    pub rotation_distance: f64,
    /// The number of microsteps the stepper motor driver uses. This
    /// parameter must be provided.
    pub microsteps: u64,
    /// The number of full steps for one rotation of the stepper motor.
    /// Set this to 200 for a 1.8 degree stepper motor or set to 400 for a
    /// 0.9 degree motor. The default is 200.
    pub full_steps_per_rotation: Option<u64>,
    /// The gear ratio if the stepper motor is connected to the axis via a
    /// gearbox. For example, one may specify "5:1" if a 5 to 1 gearbox is
    /// in use. If the axis has multiple gearboxes one may specify a comma
    /// separated list of gear ratios (for example, "57:11, 2:1"). If a
    /// gear_ratio is specified then rotation_distance specifies the
    /// distance the axis travels for one full rotation of the final gear.
    /// The default is to not use a gear ratio.
    pub gear_ratio: Option<String>,
    /// The minimum time between the step pulse signal edge and the
    /// following "unstep" signal edge. This is also used to set the
    /// minimum time between a step pulse and a direction change signal.
    /// The default is 0.000000100 (100ns) for TMC steppers that are
    /// configured in UART or SPI mode, and the default is 0.000002 (which
    /// is 2us) for all other steppers.
    pub step_pulse_duration: Option<f64>,
}

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct PositionedStepperBaselineConfig {
    #[serde(flatten)]
    pub baseline_config: StepperBaselineConfig,

    /// Minimum valid distance (in mm) the user may command the stepper to
    /// move to.  The default is 0mm.
    pub position_min: Option<f64>,
    /// Maximum velocity (in mm/s) of the stepper when homing. The default
    /// is 5mm/s.
    pub homing_speed: Option<f64>,
    /// Distance to backoff (in mm) before homing a second time during
    /// homing. Set this to zero to disable the second home. The default
    /// is 5mm.
    pub homing_retract_dist: Option<f64>,
    /// Speed to use on the retract move after homing in case this should
    /// be different from the homing speed, which is the default for this
    /// parameter
    pub homing_retract_speed: Option<f64>,
    /// Velocity (in mm/s) of the stepper when performing the second home.
    /// The default is homing_speed/2.
    pub second_homing_speed: Option<f64>,
    /// If true, homing will cause the stepper to move in a positive
    /// direction (away from zero); if false, home towards zero. It is
    /// better to use the default than to specify this parameter. The
    /// default is true if position_endstop is near position_max and false
    /// if near position_min.
    pub homing_positive_dir: Option<bool>,
}

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct GenericStepper {
    pub klipper_id: String,

    #[serde(flatten)]
    pub baseline_config: PositionedStepperBaselineConfig,

    /// Endstop switch detection pin. If this endstop pin is on a
    /// different mcu than the stepper motor then it enables "multi-mcu
    /// homing". This parameter must be provided for the X, Y, and Z
    /// steppers on cartesian style printers.
    pub endstop_pin: Option<crate::KlipperPin>,
    /// Location of the endstop (in mm). This parameter must be provided
    /// for the X, Y, and Z steppers on cartesian style printers.
    pub position_endstop: Option<f64>,
    /// Maximum valid distance (in mm) the user may command the stepper to
    /// move to. This parameter must be provided for the X, Y, and Z
    /// steppers on cartesian style printers.
    pub position_max: Option<f64>,
}
