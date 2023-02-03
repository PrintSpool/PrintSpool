use printspool_proc_macros::define_component;
#[define_component]
pub struct ZTilt {
    /// A list of X, Y coordinates (one per line; subsequent lines
    /// indented) describing the location of each bed "pivot point". The
    /// "pivot point" is the point where the bed attaches to the given Z
    /// stepper. It is described using nozzle coordinates (the X, Y position
    /// of the nozzle if it could move directly above the point). The
    /// first entry corresponds to stepper_z, the second to stepper_z1,
    /// the third to stepper_z2, etc. This parameter must be provided.
    pub z_positions: Option<f64>,
    /// A list of X, Y coordinates (one per line; subsequent lines
    /// indented) that should be probed during a Z_TILT_ADJUST command.
    /// Specify coordinates of the nozzle and be sure the probe is above
    /// the bed at the given nozzle coordinates. This parameter must be
    /// provided.
    pub points: Option<f64>,
    /// The speed (in mm/s) of non-probing moves during the calibration.
    /// The default is 50.
    pub speed: Option<f64>,
    /// The height (in mm) that the head should be commanded to move to
    /// just prior to starting a probe operation. The default is 5.
    pub horizontal_move_z: Option<f64>,
    /// Number of times to retry if the probed points aren't within
    /// tolerance.
    pub retries: Option<f64>,
    /// If retries are enabled then retry if largest and smallest probed
    /// points differ more than retry_tolerance. Note the smallest unit of
    /// change here would be a single step. However if you are probing
    /// more points than steppers then you will likely have a fixed
    /// minimum value for the range of probed points which you can learn
    /// by observing command output.
    pub retry_tolerance: Option<f64>,
}
