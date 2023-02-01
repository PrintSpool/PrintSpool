use async_trait::async_trait;
use bonsaidb::core::{define_basic_unique_mapped_view, schema::Collection};
use chrono::{DateTime, Utc};
use futures_util::{future::Either, stream::StreamExt};
use printspool_driver_interface::{driver_instance::LocalDriverInstance, task::Task, Db, DbId};
use serde_json::json;
use tokio::{
    net::unix::{OwnedWriteHalf, WriteHalf},
    sync::mpsc,
};
use tokio_util::codec::{FramedRead, FramedWrite};
use validator::Validate;

use crate::klipper_socket::Req;

#[derive(Serialize, Deserialize, Debug)]
pub struct KlipperDriverInstance {
    pub id: DbId,
    tx: KlipperSocket,
    db: Db,
    reset_when_idle_requested: bool,
}

impl KlipperDriverInstance {
    pub async fn start(id: DbId, db: Db) -> Result<Self> {
        todo!("Regenerate the klipper config file from the database");

        todo!("Start the klipper process");

        let on_socket_shutdown = |res| todo!("Change the state to errored");

        let tx = KlipperSocket::start(on_socket_shutdown).await;

        Ok(Self {
            id,
            tx,
            db,
            reset_when_idle_requested: false,
        })
    }
}

fn gcode_script(gcode: String) -> serde_json::Value {
    json!({"method": "gcode/script", "params": { "script": gcode}})
}

#[async_trait]
impl AnyHostDriverInstance for KlipperDriverInstance {
    fn id(&self) -> DbId {
        self.id
    }
    fn driver(&self) -> &'static dyn Driver {
        &KlipperDriver
    }

    async fn reset(&mut self) -> Result<()>;

    async fn reset_when_idle(&mut self) -> Result<()> {
        self.reset_when_idle_requested = true;
    }

    async fn stop(&mut self) -> Result<()> {
        self.tx.execute(json!({"method": "emergency_stop"})).await?;
        Ok()
    }

    async fn delete(&mut self) -> Result<()> {
        self.tx.execute(json!({"method": "emergency_stop"})).await?;
        todo!("Delete the printer")
    }
}

#[async_trait]
impl LocalDriverInstance for KlipperDriverInstance {
    /// Triggered when a new serial device is connected to the host
    async fn on_add_device(&mut self, device_path: String) -> Result<()> {
        Ok(())
    }

    // These should be triggered by hooks on the host
    async fn spool_task(&mut self, task: Task) -> Result<()> {
        todo!("Load the task into a file in the klipper instance's virtual SD card folder");
        let filename = "test.gcode";

        let gcode = format!("SDCARD_PRINT_FILE_FILENAME=\"{}\"", filename);

        self.tx.send(gcode_script(gcode)).await?;
        Ok(())
    }
    async fn pause_task(&mut self, task_id: DbId, pause_hook: Task) -> Result<()> {
        // TODO: verify the task ID
        self.tx
            .execute((json!({"method": "pause_resume/pause"})))
            .await?;
        Ok(())
    }
    async fn resume_task(&mut self, task: Task, resume_hook: Task) -> Result<()> {
        // TODO: verify the task ID
        self.tx
            .execute((json!({"method": "pause_resume/resume"})))
            .await?;
        Ok(())
    }
}
