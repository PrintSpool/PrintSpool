use async_codec::Framed;
use chrono::prelude::*;
use printspool_driver_interface::capability::HeaterState;
use printspool_driver_interface::component::{Component, ComponentsByType};
use printspool_driver_interface::driver_instance::{AnyHostDriverInstance, LocalDriverInstance};
use printspool_driver_interface::machine::Machine;
use printspool_driver_interface::{Db, DbId};
use xactor::Actor;
// use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
// use std::sync::Arc;
use async_std::{fs, os::unix::net::UnixStream};
use eyre::Result;

use super::GCodeHistoryEntry;
use super::{
    messages::{AddDevice, ConnectToSocket, ResetMaterialTargets},
    receive_stream::receive_stream::codec::MachineCodec,
    MachineStatus,
};
use crate::components::extruder::Extruder;
use crate::components::Toolhead;
use crate::config::MachineConfig;

pub struct MarlinDriverInstance {
    pub db: crate::Db,
    pub hooks: crate::MachineHooksList,
    pub id: DbId<Machine>,
    pub write_stream: Option<Framed<UnixStream, MachineCodec>>,
    pub unix_socket: Option<UnixStream>,
    pub attempting_to_connect: bool,
    pub has_received_feedback: bool,

    pub data: Option<MachineData>,
}

impl MarlinDriverInstance {
    #[instrument(fields(id = &self.id[..]), skip(self, ctx))]
    async fn start(&mut self, db: &Db) -> Result<()> {
        let config_path = crate::paths::etc_common().join(format!("machine-{}.toml", self.id));

        if !config_path.is_file() {
            // Currently there is no way to kill supervisors in xactor so deleted machines will
            // get restarted. For now we just prevent them from doing anything.
            info!("Config file for Machine has been deleted, actor started treated as no-op");

            return Ok(());
        }

        let result = async {
            // Run before_create hooks in a transaction around saving the config file
            let mut tx = self.db.begin().await?;

            for hooks_provider in self.hooks.iter() {
                tx = hooks_provider.before_start(tx, &self.id).await?
            }

            tx.commit().await?;

            // Begin attempting to connect to the driver socket
            ctx.address().send(ConnectToSocket)?;

            Result::<_>::Ok(())
        }
        .await;

        ctx.subscribe::<AddDevice>().await?;

        if let Err(err) = result {
            warn!("Error starting machine: {:?}", err);
            // Prevent a tight loop of actor restarts from DOSing the server
            async_std::task::sleep(std::time::Duration::from_secs(1)).await;
            ctx.stop(Some(err));
        }

        Ok(())
    }
}

impl MarlinDriverInstance {
    pub async fn start(
        db: Db,
        hooks: crate::MachineHooksList,
        machine_id: &DbId<Machine>,
    ) -> Result<Self> {
        let machine_id = machine_id.clone();
        let driver_instance = Self {
            db: db.clone(),
            hooks: hooks.clone(),
            id: machine_id.clone(),
            write_stream: None,
            unix_socket: None,
            data: None,
            attempting_to_connect: false,
            has_received_feedback: false,
        };
        Ok(machine)
    }
}

#[async_trait]
impl LocalDriverInstance for MarlinDriverInstance {
    /// Triggered when a new serial device is connected to the host
    async fn on_add_device(&mut self, device_path: String) -> Result<()> {
        todo!()
    }

    // These should be triggered by hooks on the host
    async fn spool_task(&mut self, task: Task) -> Result<()> {
        todo!()
    }
    async fn pause_task(&mut self, task_id: DbId, pause_hook: Task) -> Result<()> {
        todo!()
    }
    async fn resume_task(&mut self, task: Task, resume_hook: Task) -> Result<()> {
        todo!()
    }
}

#[async_trait]
impl AnyHostDriverInstance for MarlinDriverInstance {
    fn id(&self) -> DbId {
        todo!()
    }
    fn driver(&self) -> &'static dyn Driver {
        todo!()
    }

    async fn reset(&mut self) -> Result<()> {
        todo!()
    }
    async fn reset_when_idle(&mut self) -> Result<()> {
        todo!()
    }
    async fn stop(&mut self) -> Result<()> {
        todo!()
    }
    async fn delete(&mut self) -> Result<()> {
        todo!()
    }
}
