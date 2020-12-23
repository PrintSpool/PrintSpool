// use std::sync::Arc;
use async_graphql::{
    Object,
    ID,
    // Context,
    FieldResult,
};
// use anyhow::{
//     // anyhow,
//     Result,
//     // Context as _,
// };

use crate::machine::{
    MachineData,
    models::MachineStatusGQL,
};

use crate::components::{
    Component
};

#[Object]
impl MachineData {
    async fn id(&self) -> ID { self.config.id.into() }
    async fn status(&self) -> MachineStatusGQL { self.status.clone().into() }
    async fn paused(&self) -> bool { self.paused_task_id.is_some() }

    async fn name(&self) -> FieldResult<String> {
        Ok(self.config.name()?)
    }

    async fn components(&self) -> Vec<Component> {
        self.config.components()
    }

    // id: ID!
    // name: String!
  
    // viewers: [User!]!
  
    // """
    // The machine configuration for general settings.
    // """
    // configForm: ConfigForm!
  
    // components(componentID: ID): [Component!]!
    // plugins(package: String): [Plugin!]!
  
    // availablePackages: [String!]!
  
    // fixedListComponentTypes: [String!]!
  
    // # """
    // # The estimated number of seconds until the heater(s) reach their
    // # targetTemperature.
    // # """
    // # targetTemperaturesCountdown: Float
  
    // # """
    // # The active extruder ID
    // # """
    // # activeExtruderID: String
  
    // swapXAndYOrientation: Boolean!
    // motorsEnabled: Boolean
    // status: MachineStatusEnum!
    // error: MachineError
    // enabledMacros: [String!]!
    // # logEntries(level: String, sources: [String!], limit: Int): [LogEntry!]
    // gcodeHistory(limit: Int): [GCodeHistoryEntry!]
  
    // # movementHistory: [MovementHistoryEntry!]!
}
