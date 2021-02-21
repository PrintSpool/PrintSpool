use async_codec::Framed;
use xactor::Actor;
// use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
// use std::sync::Arc;
use async_std::{
    fs,
    os::unix::net::UnixStream,
};
use eyre::{
    // eyre,
    Result,
    // Context as _,
};

use super::{messages::ConnectToSocket, MachineStatus, streams::receive_stream::codec::MachineCodec};
use super::GCodeHistoryEntry;
use crate::config::MachineConfig;

pub struct Machine {
    pub db: crate::Db,
    pub id: crate::DbId,
    pub write_stream: Option<Framed<UnixStream, MachineCodec>>,
    pub unix_socket: Option<UnixStream>,
    pub attempting_to_connect: bool,
    pub has_received_feedback: bool,

    pub data: Option<MachineData>,
}

#[derive(new, Debug, Clone)]
pub struct MachineData {
    // Config-driven data and ephemeral component data
    pub config: MachineConfig,
    // Top-level ephemeral machine data
    #[new(default)]
    pub status: MachineStatus,
    #[new(default)]
    pub motors_enabled: bool,
    #[new(default)]
    pub gcode_history: VecDeque<GCodeHistoryEntry>,
    #[new(default)]
    pub paused_task_id: Option<crate::DbId>,
}

#[async_trait::async_trait]
impl Actor for Machine {
    #[instrument(fields(id = &self.id[..]), skip(self, ctx))]
    async fn started(&mut self, ctx: &mut xactor::Context<Self>) -> Result<()> {
        // Begin attempting to connect to the driver socket
        if let Err(err) = ctx.address().send(ConnectToSocket) {
            warn!("Error starting machine: {:?}", err);
            ctx.stop(Some(err));
        };

        Ok(())
    }
}

impl Machine {
    pub async fn start(
        db: crate::Db,
        machine_id: &crate::DbId,
    ) -> Result<xactor::Addr<Machine>> {
        let machine_id = machine_id.clone();
        let machine = xactor::Supervisor::start(move ||
            Machine {
                db: db.clone(),
                id: machine_id.clone(),
                write_stream: None,
                unix_socket: None,
                data: None,
                attempting_to_connect: false,
                has_received_feedback: false,
            }
        ).await?;
        Ok(machine)
    }

    pub async fn reset_data(&mut self) -> Result<()> {
        let config_path = format!("/etc/teg/machine-{}.toml", self.id);

        let config = fs::read_to_string(config_path).await?;
        let config: MachineConfig = toml::from_str(&config)?;

        self.data = Some(MachineData::new(config));

        Ok(())
    }
}
