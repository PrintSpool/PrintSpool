use printspool_proc_macros::define_component;
#[define_component]
pub struct BedMesh {
    /// The speed (in mm/s) of non-probing moves during the calibration.
    /// The default is 50.
    pub speed: Option<f64>,
    /// The height (in mm) that the head should be commanded to move to
    /// just prior to starting a probe operation. The default is 5.
    pub horizontal_move_z: Option<f64>,
    /// Defines the radius of the mesh to probe for round beds. Note that
    /// the radius is relative to the coordinate specified by the
    /// mesh_origin option. This parameter must be provided for round beds
    /// and omitted for rectangular beds.
    pub mesh_radius: Option<f64>,
    /// Defines the center X, Y coordinate of the mesh for round beds. This
    /// coordinate is relative to the probe's location. It may be useful
    /// to adjust the mesh_origin in an effort to maximize the size of the
    /// mesh radius. Default is 0, 0. This parameter must be omitted for
    /// rectangular beds.
    pub mesh_origin: Option<f64>,
    /// Defines the minimum X, Y coordinate of the mesh for rectangular
    /// beds. This coordinate is relative to the probe's location. This
    /// will be the first point probed, nearest to the origin. This
    /// parameter must be provided for rectangular beds.
    pub mesh_min: Option<f64>,
    /// Defines the maximum X, Y coordinate of the mesh for rectangular
    /// beds. Adheres to the same principle as mesh_min, however this will
    /// be the furthest point probed from the bed's origin. This parameter
    /// must be provided for rectangular beds.
    pub mesh_max: Option<f64>,
    /// For rectangular beds, this is a comma separate pair of integer
    /// values X, Y defining the number of points to probe along each
    /// axis. A single value is also valid, in which case that value will
    /// be applied to both axes. Default is 3, 3.
    pub probe_count: Option<f64>,
    /// For round beds, this integer value defines the maximum number of
    /// points to probe along each axis. This value must be an odd number.
    /// Default is 5.
    pub round_probe_count: Option<f64>,
    /// The gcode z position in which to start phasing out z-adjustment
    /// when fade is enabled. Default is 1.0.
    pub fade_start: Option<f64>,
    /// The gcode z position in which phasing out completes. When set to a
    /// value below fade_start, fade is disabled. It should be noted that
    /// fade may add unwanted scaling along the z-axis of a print. If a
    /// user wishes to enable fade, a value of 10.0 is recommended.
    /// Default is 0.0, which disables fade.
    pub fade_end: Option<f64>,
    /// The z position in which fade should converge. When this value is
    /// set to a non-zero value it must be within the range of z-values in
    /// the mesh. Users that wish to converge to the z homing position
    /// should set this to 0. Default is the average z value of the mesh.
    pub fade_target: Option<f64>,
    /// The amount of Z difference (in mm) along a move that will trigger
    /// a split. Default is .025.
    pub split_delta_z: Option<f64>,
    /// The distance (in mm) along a move to check for split_delta_z.
    /// This is also the minimum length that a move can be split. Default
    /// is 5.0.
    pub move_check_distance: Option<f64>,
    /// A comma separated pair of integers X, Y defining the number of
    /// points per segment to interpolate in the mesh along each axis. A
    /// "segment" can be defined as the space between each probed point.
    /// The user may enter a single value which will be applied to both
    /// axes. Default is 2, 2.
    pub mesh_pps: Option<f64>,
    /// The interpolation algorithm to use. May be either "lagrange" or
    /// "bicubic". This option will not affect 3x3 grids, which are forced
    /// to use lagrange sampling. Default is lagrange.
    pub algorithm: Option<f64>,
    /// When using the bicubic algorithm the tension parameter above may
    /// be applied to change the amount of slope interpolated. Larger
    /// numbers will increase the amount of slope, which results in more
    /// curvature in the mesh. Default is .2.
    pub bicubic_tension: Option<f64>,
    /// A point index in the mesh to reference all z values to. Enabling
    /// this parameter produces a mesh relative to the probed z position
    /// at the provided index.
    pub relative_reference_index: Option<f64>,
    /// 
    pub faulty_region_1_min: Option<f64>,
    /// Optional points that define a faulty region.  See docs/Bed_Mesh.md
    /// for details on faulty regions.  Up to 99 faulty regions may be added.
    /// By default no faulty regions are set.
    pub faulty_region_1_max: Option<f64>,
}
