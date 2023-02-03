use crate::KlipperPin;
use printspool_proc_macros::define_component;
#[define_component]
pub struct SmartEffector {
    /// Pin connected to the Smart Effector Z Probe output pin (pin 5). Note that
    /// pullup resistor on the board is generally not required. However, if the
    /// output pin is connected to the board pin with a pullup resistor, that
    /// resistor must be high value (e.g. 10K Ohm or more). Some boards have a low
    /// value pullup resistor on the Z probe input, which will likely result in an
    /// always-triggered probe state. In this case, connect the Smart Effector to
    /// a different pin on the board. This parameter is required.
    pub pin: KlipperPin,
    /// Pin connected to the Smart Effector control input pin (pin 7). If provided,
    /// Smart Effector sensitivity programming commands become available.
    pub control_pin: Option<KlipperPin>,
    /// If set, limits the acceleration of the probing moves (in mm/sec^2).
    /// A sudden large acceleration at the beginning of the probing move may
    /// cause spurious probe triggering, especially if the hotend is heavy.
    /// To prevent that, it may be necessary to reduce the acceleration of
    /// the probing moves via this parameter.
    pub probe_accel: Option<f64>,
    /// A delay between the travel moves and the probing moves in seconds. A fast
    /// travel move prior to probing may result in a spurious probe triggering.
    /// This may cause 'Probe triggered prior to movement' errors if no delay
    /// is set. Value 0 disables the recovery delay.
    /// Default value is 0.4.
    pub recovery_time: Option<f64>,
    /// 
    pub x_offset: Option<f64>,
    /// Should be left unset (or set to 0).
    pub y_offset: Option<f64>,
    /// Trigger height of the probe. Start with -0.1 (mm), and adjust later using
    /// `PROBE_CALIBRATE` command. This parameter must be provided.
    pub z_offset: f64,
    /// Speed (in mm/s) of the Z axis when probing. It is recommended to start
    /// with the probing speed of 20 mm/s and adjust it as necessary to improve
    /// the accuracy and repeatability of the probe triggering.
    pub speed: Option<f64>,
    /// 
    pub samples: Option<f64>,
    /// 
    pub sample_retract_dist: Option<f64>,
    /// 
    pub samples_result: Option<f64>,
    /// 
    pub samples_tolerance: Option<f64>,
    /// 
    pub samples_tolerance_retries: Option<f64>,
    /// 
    pub activate_gcode: Option<f64>,
    /// 
    pub deactivate_gcode: Option<f64>,
    /// See the "probe" section for more information on the parameters above.
    pub deactivate_on_each_sample: Option<f64>,
}
