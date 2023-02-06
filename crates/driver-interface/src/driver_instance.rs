use crate::driver::Driver;
use crate::machine::Machine;
use crate::task::Task;
use crate::DbId;
use async_trait::async_trait;
use eyre::Result;

/// A CNC Machine or 3D Printer on any host in the network (ie. local to this host or a machine connected to a remote host)
#[async_trait]
pub trait AnyHostDriverInstance: Sync + Send {
    fn id(&self) -> DbId<Machine>;
    fn driver(&self) -> &'static dyn Driver;

    async fn reset(&mut self) -> Result<()>;
    async fn reset_when_idle(&mut self) -> Result<()>;
    async fn stop(&mut self) -> Result<()>;
    async fn delete(&mut self) -> Result<()>;
}

/// A CNC Machine or 3D printer directly connected to and controlled by this host
#[async_trait]
pub trait LocalDriverInstance: Sync + Send + AnyHostDriverInstance {
    /// Triggered when a new serial device is connected to the host
    async fn on_add_device(&mut self, device_path: String) -> Result<()>;

    // These should be triggered by hooks on the host
    async fn spool_task(&mut self, task: Task) -> Result<()>;
    async fn pause_task(&mut self, task_id: DbId<Task>, pause_hook: Task) -> Result<()>;
    async fn resume_task(&mut self, task: Task, resume_hook: Task) -> Result<()>;
}

// These could perhaps be done outside of the driver with just a call to reset_when_idle after:
//
// async fn add_component(&self, value: serde_json::Value) -> Result<Box<dyn DriverComponent>>;
// async fn update_component(
//     &self,
//     id: DbId,
//     version: i32,
//     model: serde_json::Value,
// ) -> Result<Box<dyn DriverComponent>>;
// async fn remove_component(&self, id: DbId) -> Result<Box<dyn DriverComponent>>;

// TODO: These 2 should perhaps be internal to the driver:
//
// // TODO: This should be triggered via pubsub when a material is assigned to a component on the machine
// async fn on_set_materials(&self, device_path: String) -> Result<()>;
// // TODO: This should be triggered via pubsub when a material is updated
// async fn on_update_materials(&self, device_path: String) -> Result<()>;

// Placeholder. In the future an implementation of AnyHostMachine may be added to allow for access to machiens on
// other hosts in a network.
pub struct RemoteDriverInstance {
    pub host_id: String,
    pub machine_id: String,
}

// impl AnyHostMachine for RemoteDriverInstance {

// }
