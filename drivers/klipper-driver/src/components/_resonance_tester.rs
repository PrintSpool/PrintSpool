use printspool_proc_macros::define_component;
#[define_component]
pub struct ResonanceTester {
    /// A list of X, Y, Z coordinates of points (one point per line) to test
    /// resonances at. At least one point is required. Make sure that all
    /// points with some safety margin in XY plane (~a few centimeters)
    /// are reachable by the toolhead.
    pub probe_points: Option<f64>,
    /// A name of the accelerometer chip to use for measurements. If
    /// adxl345 chip was defined without an explicit name, this parameter
    /// can simply reference it as "accel_chip: adxl345", otherwise an
    /// explicit name must be supplied as well, e.g. "accel_chip: adxl345
    /// my_chip_name". Either this, or the next two parameters must be
    /// set.
    pub accel_chip: Option<f64>,
    /// 
    pub accel_chip_x: Option<f64>,
    /// Names of the accelerometer chips to use for measurements for each
    /// of the axis. Can be useful, for instance, on bed slinger printer,
    /// if two separate accelerometers are mounted on the bed (for Y axis)
    /// and on the toolhead (for X axis). These parameters have the same
    /// format as 'accel_chip' parameter. Only 'accel_chip' or these two
    /// parameters must be provided.
    pub accel_chip_y: Option<f64>,
    /// Maximum input shaper smoothing to allow for each axis during shaper
    /// auto-calibration (with 'SHAPER_CALIBRATE' command). By default no
    /// maximum smoothing is specified. Refer to Measuring_Resonances guide
    /// for more details on using this feature.
    pub max_smoothing: Option<f64>,
    /// Minimum frequency to test for resonances. The default is 5 Hz.
    pub min_freq: Option<f64>,
    /// Maximum frequency to test for resonances. The default is 133.33 Hz.
    pub max_freq: Option<f64>,
    /// This parameter is used to determine which acceleration to use to
    /// test a specific frequency: accel = accel_per_hz * freq. Higher the
    /// value, the higher is the energy of the oscillations. Can be set to
    /// a lower than the default value if the resonances get too strong on
    /// the printer. However, lower values make measurements of
    /// high-frequency resonances less precise. The default value is 75
    /// (mm/sec).
    pub accel_per_hz: Option<f64>,
    /// Determines the speed of the test. When testing all frequencies in
    /// range [min_freq, max_freq], each second the frequency increases by
    /// hz_per_sec. Small values make the test slow, and the large values
    /// will decrease the precision of the test. The default value is 1.0
    /// (Hz/sec == sec^-2).
    pub hz_per_sec: Option<f64>,
}
