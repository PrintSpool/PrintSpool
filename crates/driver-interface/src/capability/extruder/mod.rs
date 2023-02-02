use eyre::{
    eyre,
    Result,
    // Context as _,
};
use printspool_json_store::Record as _;
use printspool_material::{Material, MaterialConfigEnum};
use regex::Regex;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::config::MachineConfig;

use super::ComponentInner;
use super::{AxisEphemeral, HeaterEphemeral};

mod toolhead_resolvers;

#[derive(
    async_graphql::SimpleObject, Debug, Serialize, Deserialize, Collection, Clone, SmartDefault,
)]
#[collection(name = "extruder_state", views = [], natural_id = |entry: ExtruderState| entry.id)]
pub struct ExtruderState {
    pub id: DbId<Self>,

    pub actuator: ActuatorState,
}
