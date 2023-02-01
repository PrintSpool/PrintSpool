use std::{collections::HashMap, marker::PhantomData, path::PathBuf};

use bonsaidb::core::{
    connection::AsyncConnection,
    define_basic_mapped_view, define_basic_unique_mapped_view,
    document::{CollectionDocument, Header},
    schema::{
        view::map::Mappings, Collection, CollectionViewSchema, ReduceResult, View, ViewMapResult,
        ViewMappedValue,
    },
    transaction::Transaction,
};
use dashmap::DashMap;
use eyre::Result;
use num_derive::{FromPrimitive, ToPrimitive};
use serde::{Deserialize, Serialize};
use std::time::Duration;
use strum::EnumIter;
use time::OffsetDateTime;
use typemap::TypeMap;

use crate::binary_nanoid::nanoid_to_bytes;

// Associated with a Target Position sensor
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Component {
    pub id: crate::DbId,
    pub machine_id: crate::DbId,
    pub component_id: crate::DbId,
    pub sensor_index: SensorIndex,
}

// Associated with a Target Position sensor
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Axis {
    // axis specific configs
}

// Associated with a Target Position sensor
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Extruder {
    // extruder specific configs
}

/// Sensors record data over time (such as target temperatures and actual temperatures)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Sensor {
    pub id: crate::DbId,
    pub machine_id: crate::DbId,
    pub component_id: crate::DbId,
    /// A machine-specific sensor index to allow for space-efficent recording of data from up to 65,536 unique senors
    pub index: SensorIndex,
    pub sensor_type: SensorType,
    /// The address for this sensor as it is refered to in GCode
    /// eg. The TargetTemperature for an extruder might be "e0" or the ActualPosition for an axis of movement might be "x"
    pub gcode_address: String,
}

pub type SensorIndex = u16;

/// The type of a sensor as well as its current value
pub enum SensorType {
    ActualTemperature(Sa<ActualTemperature>),
    TargetTemperature(Sa<TargetTemperature>),
    ActualPosition(Sa<ActualPosition>),
    TargetPosition(Sa<TargetPosition>),
    TargetFanSpeed(Sa<TargetFanSpeed>),
}

/// Associates a SensorType to a SensorValue.
///
/// Example Useage:
/// ```
/// let actual_temperature = for sensor in sensors {
///     sensor.match {
///         ActualTemperature(at) -> break at.get_value(sensor_values, sensor),
///         _ => continue,
///     }
/// }
/// ```
struct SensorAssociation<V: SensorValue>;
type Sa<T> = SensorAssociation<T>;

impl<T> SensorAssociation<T> {
    pub fn get_value(&self, sensor_values: &SensorValuesInMemory, sensor: &Sensor) -> Option<T> {
        let type_map = sensor_values.get((sensor.machine_id, sensor.gcode_address))?;

        type_map.get::<T>()
    }
}

pub trait SensorValue: std::fmt::Debug + Send + Sync {}

struct ActualTemperature(MilliKelvin);
impl SensorValue for ActualTemperature {}

struct TargetTemperature(MilliKelvin);
impl SensorValue for TargetTemperature {}

struct ActualPosition(FemtoMeter);
impl SensorValue for ActualPosition {}

struct TargetPosition(FemtoMeter);
impl SensorValue for TargetPosition {}

struct TargetFanSpeed(u8);
impl SensorValue for TargetPosition {}

/// Sensor values in-memory store keyed for gcode by (machine_id, gcode_address) and then accessed by the type of value
type SensorValuesInMemory = DashMap<(crate::DbId, String), TypeMap<dyn SensorValue>>;

/// Sensor data is optimized to take up less disk space, it is also indexed by the machine ID and then by it's timestamp
/// for efficient retreval.
///
/// Rough size estimate for 3 sensors: 4 + (4 byte ID + 8 byte timestamp) * 2 (for index + storage) + 3 * (2 + 4 + 1) bytes
/// = 49 bytes per reading.
/// At 2 samples per second that's ~254MB of data per month of continuous readings (or ~1.5GB for 6 months).
///
/// TODO: Sensor data should be set to automatically expire after ~6 months and should be deleted before compaction.
/// TODO: Scheduling compaction is not yet implemented.
#[derive(Debug, Serialize, Deserialize, Clone, Collection)]
#[collection(name = "sensor_samples", views = [SensorMeasurmentsTimeline])]
pub struct SensorSample {
    pub machine_id: crate::DbId,
    // Timestamps
    pub sampled_at: OffsetDateTime,
    // Props
    /// Sensor data keyed by their machine-specific index (eg. an extruder's target and/or actual temperatures).
    /// A missing sensor should be interpretted as unchanged since the previous value.
    pub measurements: SampleMeasurements,
}

type SampleMeasurements<T = MilliKelvin> = HashMap<SensorIndex, SensorSampleValue<T>>;

pub enum SensorSampleValue<T = MilliKelvin> {
    Temperature(T),
    // If higher accuracy or different maximum size is needed at some point in the future, differently scaled values could be added to this enum.
    // Eg. `HighPrecisionTemperature(AttoKelvin)`
}

/// A integer-based temperature scalar that adds without floating point rounding errors and can scale from
/// 0.001 degrees Kelven to over 4 million degrees Kelvin.
pub struct MilliKelvin(u32);
const MILLI_DIVISOR: u64 = 10.pow(3);

impl MilliKelvin {
    fn from_kelvin_f32(value: f32) -> Self {
        // Saturating conversion
        (value.min(0) as f64) * (MILLI_DIVISOR as f64).try_into().unwrap_or(u32::MAX)
    }

    fn from_celsius_f32(value: f32) -> Self {
        Self::from_kelvin_f32(value + 273.15)
    }

    fn to_celsius_f32(&self) -> f32 {
        ((self.0 as f64) / (MILLI_DIVISOR as f64)) as f32
    }
}

pub struct MilliKelvinU64(u64);

impl From<MilliKelvin> for MilliKelvinU64 {
    fn from(value: MilliKelvin) -> Self {
        MilliKelvinU64(value.0 as u64)
    }
}

impl MilliKelvinU64 {
    pub fn saturating_to_u32(&self) -> MilliKelvin {
        MilliKelvin(self.0.try_into().unwrap_or(u32::MAX))
    }
}

/// A integer measurement with femtometer precision (10^-15 meters) This should support:
/// - Sub-atomic distances down to 1 femtometer (for example, the radius of the atomic nucleus of gold is 8.45 femtometers)
/// - Large distances up to 18km
///
/// Need something larger, smaller, or both? Are you constructing a spaceship using a sub-atomic 3D printer? Let me know!
pub struct FemtoMeter(u64);
const FEMTO_DIVISOR: u64 = 10.pow(15);

impl FemtoMeter {
    fn from_meters_f64(value: f64) -> Self {
        // Saturating conversion
        value
            * (FEMTO_DIVISOR as f64)
                .max(i32::MAX as f64)
                .min(i32::MIN as f64) as i32
    }

    fn from_meters_f32(value: f32) -> Self {
        Self::from_meters_f64(value as f64)
    }

    fn from_millis_f64(value: f64) -> Self {
        Self::from_meters_f64(value / (MILLI_DIVISOR as f64))
    }

    fn from_millis_f32(value: f32) -> Self {
        Self::from_millis_f64(value as f64)
    }
}

// ## Averaging indexes
//
// SampleAveraging is designed to allow users to efficiently zoom from viewing data over the past 10 seonds
// at a resolution of 2 data points per seconds out to a timescale of just over 2 years.
//
// The scale of these sampling periods are designed to keep the number of averaged samples for any timewindow between ~20 and 1080 data points
// except for the last sampling period which goes to 3,240 to accomodate large timewindows.
//
// 1080 samples * 50B = 54kB to load a normal timewindow into memory.
// 3,240 samples * 50B = 162kB to load the last timewindow into memory.
//
// Once a timewindow is loaded into memory it should be appropriately downsampled before sending to a client.
//
// The averaging periods zoom out by a relatively consistent scaling factor but are adjusted to intutitive time divisions for a
// human viewer.
#[derive(EnumIter, FromPrimitive, ToPrimitive)]
pub enum SampleAveraging {
    // Samples every half seconds should be used for loading sensor data at a 10 second to 8 minutes scale (20 to 960 samples)
    None = 0,
    // Samples every 20 seconds should be used for loading sensor data at a 8 minutes to 6 hours scale (24 to 1080 samples)
    Every20Secs = 20,
    // Samples every 15 minutes should be used for loading sensor data at a 6 hours to 10 days scale (24 to 960 samples)
    Every15Mins = 15 * 60,
    // Samples every 6 hours should be used for loading sensor data at a 10 days to 27 months (2 years and 3 months) scale (40 to 3,240 samples)
    //
    // The reason this is a lower increment then it could be is because of the number of records this needs to aggregate over.
    // At 6 hours, calculating this largest aggregation has to load somewhere around 6 * 3600 * 2 * 50B = ~2MB into RAM per sensor.
    //
    // This largest timescale should not need to recalculated frequently. If a user loads data at this timescale it should only need
    // to be re-rendered in their UI at most once every 6 hours (meaning 1 query to this view every 6 hours).
    Every6Hrs = 6 * 3600,
}

struct AveragedSample<T> {
    quantity: u32,
    sensor_value: SensorSampleValue<T>,
}

#[derive(Debug, Clone, View)]
#[view(collection = SensorSample, key = (crate::DbId, SampleAveraging, OffsetDateTime, SensorIndex), value = AveragedSample, name = "avg_by:machine|sampled_at|sensor")]
struct SensorMeasurmentsTimeline;

impl CollectionViewSchema for SensorMeasurmentsTimeline {
    type View = Self;

    fn map(&self, document: CollectionDocument<SensorSample>) -> ViewMapResult<Self::View> {
        let SensorSample {
            machine_id,
            sampled_at,
            measurements,
        } = document.content;

        let map = measurements
            .into_iter()
            .zip(SampleAveraging::iter())
            .map(|((sensor_index, sensor_value), averaging)| {
                let sec_per_avg = averaging.to_u32 as i64;
                let sampling_period = (sampled_at.unix_timestamp() / sec_per_avg) * sec_per_avg;

                document.header.emit_key_and_value(
                    (
                        machine_id,
                        averaging,
                        OffsetDateTime::from_unix_timestamp(sampling_period),
                        sensor_index,
                    ),
                    AveragedSample {
                        quantity: 1,
                        sensor_value,
                    },
                )
            })
            .reduce(|a, b| a.and(b))
            .unwrap_or_else(|| Mappings::none());

        Ok(map)
    }

    fn reduce(
        &self,
        mappings: &[ViewMappedValue<Self>],
        _rereduce: bool,
    ) -> ReduceResult<Self::View> {
        // Calculating a new average sensor value

        // Averaging Step 1: Sum each averaged sensor value multiplied by the quantity of measurements they aggregate over.
        // - Care is taken to store the sensor value sum in a larger data type to avoid overflows.
        // - If the type of the sensor value erroneously changes then data before the change are dropped.
        let aggregate: AveragedSample<MilliKelvinU64> = mappings.reduce(|a, b| {
            let mut quantity = b.quantity;

            let sensor_value = match b.sensor_value {
                SensorSampleValue::Temperature(b_val) => {
                    let mut total: u64 = b * b.quantity;

                    if let SensorSampleValue::<_>::Temperature(a_val) = a {
                        quantity += a.quantity;
                        total += a_val * a.quantity;
                    };

                    SensorSampleValue::Temperature(total)
                }
            };

            AveragedSample {
                quantity,
                sensor_value,
            }
        });

        // Averaging Step 2: Divide the sum'd sensor values by the total quantity.
        match aggregate.sensor_value {
            SensorSampleValue::Temperature(&mut v) => *v = v / aggregate.quantity,
        };

        Ok(aggregate)
    }
}
