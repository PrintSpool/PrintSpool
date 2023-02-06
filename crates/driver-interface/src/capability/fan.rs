use printspool_proc_macros::printspool_collection;

#[derive(async_graphql::SimpleObject)]
#[printspool_collection]
pub struct FanState {
    /// The expected speed of the fan when it is enabled as a 0-100% percentage of it's
    /// max speed.
    pub target_speed: Option<f32>,
    /// The current speed of the fan as a 0-100% percentage of it's max speed.
    pub actual_speed: Option<f32>,
    /// True if the SpeedController is on.
    pub enabled: bool,
}
