use printspool_proc_macros::printspool_collection;

#[derive(async_graphql::SimpleObject)]
#[printspool_collection]
pub struct HeaterState {
    /// The target temperature in °C for this heater. The heater will attempt to make
    /// the actualTemperature equal to this temperature.
    pub target_temperature: Option<f32>,
    /// The current temperature in °C recorded by the heater’s thermocouple or
    /// thermister.
    pub actual_temperature: Option<f32>,
    pub enabled: bool,
    /// True if the machine is waiting on this heater to reach it’s targetTemp and
    /// preventing any more gcodes from executing until it does.
    pub blocking: bool,
    // pub history: VecDeque<TemperatureHistoryEntry>,
}

// todo: material_target should be looked up based on the component's configured material at query time
// /// The current material's configured temperature in °C for this heater.
// ///
// /// For build platforms if multiple toolhead materials are loaded but then the
// /// material_target is set to their average.
// ///
// /// When the Heater is enabled the toolhead target_temperature will normally be set to the
// /// material_target.
// pub material_target: Option<f32>,

// static NEXT_TEMPERATURE_ID: AtomicU64 = AtomicU64::new(0);

// #[derive(async_graphql::SimpleObject, new, Debug, Serialize, Deserialize, Clone)]
// pub struct TemperatureHistoryEntry {
//     #[new(value = "NEXT_TEMPERATURE_ID.fetch_add(1, Ordering::SeqCst).into()")]
//     pub id: async_graphql::ID,
//     // Timestamps
//     #[new(value = "Utc::now()")]
//     pub created_at: DateTime<Utc>,
//     // Props
//     #[new(default)]
//     pub target_temperature: Option<f32>,
//     #[new(default)]
//     pub actual_temperature: Option<f32>,
// }
