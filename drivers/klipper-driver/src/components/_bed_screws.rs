use printspool_proc_macros::define_component;
#[define_component]
pub struct BedScrews {
    /// The X, Y coordinate of the first bed leveling screw. This is a
    /// position to command the nozzle to that is directly above the bed
    /// screw (or as close as possible while still being above the bed).
    /// This parameter must be provided.
    pub screw1: Option<f64>,
    /// An arbitrary name for the given screw. This name is displayed when
    /// the helper script runs. The default is to use a name based upon
    /// the screw XY location.
    pub screw1_name: Option<f64>,
    /// An X, Y coordinate to command the nozzle to so that one can fine
    /// tune the bed leveling screw. The default is to not perform fine
    /// adjustments on the bed screw.
    pub screw1_fine_adjust: Option<f64>,
    /// 
    pub screw2: Option<f64>,
    /// 
    pub screw2_name: Option<f64>,
    /// Additional bed leveling screws. At least three screws must be
    /// defined.
    pub screw2_fine_adjust: Option<f64>,
    /// The height (in mm) that the head should be commanded to move to
    /// when moving from one screw location to the next. The default is 5.
    pub horizontal_move_z: Option<f64>,
    /// The height of the probe (in mm) after adjusting for the thermal
    /// expansion of bed and nozzle. The default is zero.
    pub probe_height: Option<f64>,
    /// The speed (in mm/s) of non-probing moves during the calibration.
    /// The default is 50.
    pub speed: Option<f64>,
    /// The speed (in mm/s) when moving from a horizontal_move_z position
    /// to a probe_height position. The default is 5.
    pub probe_speed: Option<f64>,
}
