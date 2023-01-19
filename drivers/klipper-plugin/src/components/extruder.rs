use crate::{KlipperId, KlipperPin, StepperBaselineConfig};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Extruder {
    pub klipper_id: KlipperId,

    #[serde(flatten)]
    pub baseline_config: HeaterBaseline,

    /// See the "stepper" section for a description of the above
    /// parameters. If none of the above parameters are specified then no
    /// stepper will be associated with the nozzle hotend (though a
    /// SYNC_EXTRUDER_MOTION command may associate one at run-time).
    #[serde(flatten)]
    pub stepper: Option<StepperBaselineConfig>,

    /// Diameter of the nozzle orifice (in mm). This parameter must be
    /// provided.
    pub nozzle_diameter: f64,
    /// The nominal diameter of the raw filament (in mm) as it enters the
    /// extruder. This parameter must be provided.
    pub filament_diameter: f64,
    /// Maximum area (in mm^2) of an extrusion cross section (eg,
    /// extrusion width multiplied by layer height). This setting prevents
    /// excessive amounts of extrusion during relatively small XY moves.
    /// If a move requests an extrusion rate that would exceed this value
    /// it will cause an error to be returned. The default is: 4.0 *
    /// nozzle_diameter^2
    pub max_extrude_cross_section: Option<f64>,
    /// The maximum instantaneous velocity change (in mm/s) of the
    /// extruder during the junction of two moves. The default is 1mm/s.
    pub instantaneous_corner_velocity: Option<f64>,
    /// Maximum length (in mm of raw filament) that a retraction or
    /// extrude-only move may have. If a retraction or extrude-only move
    /// requests a distance greater than this value it will cause an error
    /// to be returned. The default is 50mm.
    pub max_extrude_only_distance: Option<f64>,
    ///
    pub max_extrude_only_velocity: Option<f64>,
    /// Maximum velocity (in mm/s) and acceleration (in mm/s^2) of the
    /// extruder motor for retractions and extrude-only moves. These
    /// settings do not have any impact on normal printing moves. If not
    /// specified then they are calculated to match the limit an XY
    /// printing move with a cross section of 4.0*nozzle_diameter^2 would
    /// have.
    pub max_extrude_only_accel: Option<f64>,
    /// The amount of raw filament to push into the extruder during
    /// extruder acceleration. An equal amount of filament is retracted
    /// during deceleration. It is measured in millimeters per
    /// millimeter/second. The default is 0, which disables pressure
    /// advance.
    pub pressure_advance: Option<f64>,
    /// A time range (in seconds) to use when calculating the average
    /// extruder velocity for pressure advance. A larger value results in
    /// smoother extruder movements. This parameter may not exceed 200ms.
    /// This setting only applies if pressure_advance is non-zero. The
    /// default is 0.040 (40 milliseconds).
    /// The remaining variables describe the extruder heater.
    pub pressure_advance_smooth_time: Option<f64>,
    /// PWM output pin controlling the heater. This parameter must be
    /// provided.
    pub heater_pin: KlipperPin,
    /// The maximum power (expressed as a value from 0.0 to 1.0) that the
    /// heater_pin may be set to. The value 1.0 allows the pin to be set
    /// fully enabled for extended periods, while a value of 0.5 would
    /// allow the pin to be enabled for no more than half the time. This
    /// setting may be used to limit the total power output (over extended
    /// periods) to the heater. The default is 1.0.
    pub max_power: Option<f64>,
    ///
    #[serde(rename = "pid_Kp")]
    pub pid_kp: f64,
    ///
    #[serde(rename = "pid_Ki")]
    pub pid_ki: f64,
    /// The proportional (pid_Kp), integral (pid_Ki), and derivative
    /// (pid_Kd) settings for the PID feedback control system. Klipper
    /// evaluates the PID settings with the following general formula:
    /// heater_pwm = (Kp*error + Ki*integral(error) - Kd*derivative(error)) / 255
    /// Where "error" is "requested_temperature - measured_temperature"
    /// and "heater_pwm" is the requested heating rate with 0.0 being full
    /// off and 1.0 being full on. Consider using the PID_CALIBRATE
    /// command to obtain these parameters. The pid_Kp, pid_Ki, and pid_Kd
    /// parameters must be provided for PID heaters.
    #[serde(rename = "pid_Kd")]
    pub pid_kd: f64,
    /// Time in seconds for each software PWM cycle of the heater. It is
    /// not recommended to set this unless there is an electrical
    /// requirement to switch the heater faster than 10 times a second.
    /// The default is 0.100 seconds.
    pub pwm_cycle_time: Option<f64>,
    /// The minimum temperature (in Celsius) at which extruder move
    /// commands may be issued. The default is 170 Celsius.
    pub min_extrude_temp: Option<f64>,
}

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct HeaterBaseline {
    /// Type of sensor - common thermistors are "EPCOS 100K B57560G104F",
    /// "ATC Semitec 104GT-2", "ATC Semitec 104NT-4-R025H42G", "Generic
    /// 3950","Honeywell 100K 135-104LAG-J01", "NTC 100K MGB18-104F39050L32",
    /// "SliceEngineering 450", and "TDK NTCG104LH104JT1". See the
    /// "Temperature sensors" section for other sensors. This parameter
    /// must be provided.
    pub sensor_type: String,
    /// Analog input pin connected to the sensor. This parameter must be
    /// provided.
    pub sensor_pin: KlipperPin,
    /// The resistance (in ohms) of the pullup attached to the thermistor.
    /// This parameter is only valid when the sensor is a thermistor. The
    /// default is 4700 ohms.
    pub pullup_resistor: Option<f64>,
    /// A time value (in seconds) over which temperature measurements will
    /// be smoothed to reduce the impact of measurement noise. The default
    /// is 1 seconds.
    pub smooth_time: Option<f64>,
    /// Control algorithm (either pid or watermark). This parameter must
    /// be provided.
    pub control: HeaterControlAlgorithm,
    /// On 'watermark' controlled heaters this is the number of degrees in
    /// Celsius above the target temperature before disabling the heater
    /// as well as the number of degrees below the target before
    /// re-enabling the heater. The default is 2 degrees Celsius.
    pub max_delta: Option<f64>,
    ///
    pub min_temp: f64,
    /// The maximum range of valid temperatures (in Celsius) that the
    /// heater must remain within. This controls a safety feature
    /// implemented in the micro-controller code - should the measured
    /// temperature ever fall outside this range then the micro-controller
    /// will go into a shutdown state. This check can help detect some
    /// heater and sensor hardware failures. Set this range just wide
    /// enough so that reasonable temperatures do not result in an error.
    /// These parameters must be provided.
    pub max_temp: f64,
}

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
#[serde(rename_all = "snake_case")]
pub enum HeaterControlAlgorithm {
    Pid,
    Watermark,
}
