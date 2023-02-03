use crate::KlipperPin;
use printspool_proc_macros::define_component;
#[define_component]
pub struct Probe {
    /// Probe detection pin. If the pin is on a different microcontroller
    /// than the Z steppers then it enables "multi-mcu homing". This
    /// parameter must be provided.
    pub pin: KlipperPin,
    /// This determines if Klipper should execute deactivation gcode
    /// between each probe attempt when performing a multiple probe
    /// sequence. The default is True.
    pub deactivate_on_each_sample: Option<f64>,
    /// The distance (in mm) between the probe and the nozzle along the
    /// x-axis. The default is 0.
    pub x_offset: Option<f64>,
    /// The distance (in mm) between the probe and the nozzle along the
    /// y-axis. The default is 0.
    pub y_offset: Option<f64>,
    /// The distance (in mm) between the bed and the nozzle when the probe
    /// triggers. This parameter must be provided.
    pub z_offset: f64,
    /// Speed (in mm/s) of the Z axis when probing. The default is 5mm/s.
    pub speed: Option<f64>,
    /// The number of times to probe each point. The probed z-values will
    /// be averaged. The default is to probe 1 time.
    pub samples: Option<f64>,
    /// The distance (in mm) to lift the toolhead between each sample (if
    /// sampling more than once). The default is 2mm.
    pub sample_retract_dist: Option<f64>,
    /// Speed (in mm/s) of the Z axis when lifting the probe between
    /// samples. The default is to use the same value as the 'speed'
    /// parameter.
    pub lift_speed: Option<f64>,
    /// The calculation method when sampling more than once - either
    /// "median" or "average". The default is average.
    pub samples_result: Option<f64>,
    /// The maximum Z distance (in mm) that a sample may differ from other
    /// samples. If this tolerance is exceeded then either an error is
    /// reported or the attempt is restarted (see
    /// samples_tolerance_retries). The default is 0.100mm.
    pub samples_tolerance: Option<f64>,
    /// The number of times to retry if a sample is found that exceeds
    /// samples_tolerance. On a retry, all current samples are discarded
    /// and the probe attempt is restarted. If a valid set of samples are
    /// not obtained in the given number of retries then an error is
    /// reported. The default is zero which causes an error to be reported
    /// on the first sample that exceeds samples_tolerance.
    pub samples_tolerance_retries: Option<f64>,
    /// A list of G-Code commands to execute prior to each probe attempt.
    /// See docs/Command_Templates.md for G-Code format. This may be
    /// useful if the probe needs to be activated in some way. Do not
    /// issue any commands here that move the toolhead (eg, G1). The
    /// default is to not run any special G-Code commands on activation.
    pub activate_gcode: Option<f64>,
    /// A list of G-Code commands to execute after each probe attempt
    /// completes. See docs/Command_Templates.md for G-Code format. Do not
    /// issue any commands here that move the toolhead. The default is to
    /// not run any special G-Code commands on deactivation.
    pub deactivate_gcode: Option<f64>,
}
