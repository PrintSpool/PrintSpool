use crate::KlipperPin;
use printspool_proc_macros::define_component;
#[define_component]
pub struct Bltouch {
    /// Pin connected to the BLTouch sensor pin. Most BLTouch devices
    /// require a pullup on the sensor pin (prefix the pin name with "^").
    /// This parameter must be provided.
    pub sensor_pin: KlipperPin,
    /// Pin connected to the BLTouch control pin. This parameter must be
    /// provided.
    pub control_pin: KlipperPin,
    /// The amount of time (in seconds) to wait for the BLTouch pin to
    /// move up or down. The default is 0.680 seconds.
    pub pin_move_time: Option<f64>,
    /// This determines if Klipper should command the pin to move up
    /// between each probe attempt when performing a multiple probe
    /// sequence. Read the directions in docs/BLTouch.md before setting
    /// this to False. The default is True.
    pub stow_on_each_sample: Option<f64>,
    /// If this is set to True then Klipper will probe with the device in
    /// "touch_mode". The default is False (probing in "pin_down" mode).
    pub probe_with_touch_mode: Option<f64>,
    /// Set if the BLTouch consistently reports the probe in a "not
    /// triggered" state after a successful "pin_up" command. This should
    /// be True for all genuine BLTouch devices. Read the directions in
    /// docs/BLTouch.md before setting this to False. The default is True.
    pub pin_up_reports_not_triggered: Option<f64>,
    /// Set if the BLTouch consistently reports a "triggered" state after
    /// the commands "pin_up" followed by "touch_mode". This should be
    /// True for all genuine BLTouch devices. Read the directions in
    /// docs/BLTouch.md before setting this to False. The default is True.
    pub pin_up_touch_mode_reports_triggered: Option<f64>,
    /// Request a specific sensor pin output mode on the BLTouch V3.0 (and
    /// later). This setting should not be used on other types of probes.
    /// Set to "5V" to request a sensor pin output of 5 Volts (only use if
    /// the controller board needs 5V mode and is 5V tolerant on its input
    /// signal line). Set to "OD" to request the sensor pin output use
    /// open drain mode. The default is to not request an output mode.
    pub set_output_mode: Option<f64>,
    /// 
    pub x_offset: Option<f64>,
    /// 
    pub y_offset: Option<f64>,
    /// 
    pub z_offset: Option<f64>,
    /// 
    pub speed: Option<f64>,
    /// 
    pub lift_speed: Option<f64>,
    /// 
    pub samples: Option<f64>,
    /// 
    pub sample_retract_dist: Option<f64>,
    /// 
    pub samples_result: Option<f64>,
    /// 
    pub samples_tolerance: Option<f64>,
    /// See the "probe" section for information on these parameters.
    pub samples_tolerance_retries: Option<f64>,
}
