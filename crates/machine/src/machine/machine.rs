use async_codec::Framed;
use chrono::prelude::*;
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

use super::{MachineStatus, messages::{AddDevice, ConnectToSocket, ResetMaterialTargets}, streams::receive_stream::codec::MachineCodec};
use super::GCodeHistoryEntry;
use crate::config::MachineConfig;
use crate::components::Toolhead;

pub struct Machine {
    pub db: crate::Db,
    pub hooks: crate::MachineHooksList,
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
    #[new(value = "true")]
    pub absolute_positioning: bool,
    #[new(value = "PositioningUnits::Millimeters")]
    pub positioning_units: PositioningUnits,
    #[new(default)]
    pub blocked_at: Option<DateTime<Utc>>,
    #[new(default)]
    pub gcode_history: VecDeque<GCodeHistoryEntry>,
}

#[derive(Debug, Clone)]
pub enum PositioningUnits {
    Millimeters,
    Inches,
}

#[async_trait::async_trait]
impl Actor for Machine {
    #[instrument(fields(id = &self.id[..]), skip(self, ctx))]
    async fn started(&mut self, ctx: &mut xactor::Context<Self>) -> Result<()> {
        let result = async {
            // Run before_create hooks in a transaction around saving the config file
            let mut tx = self.db.begin().await?;

            for hooks_provider in self.hooks.iter() {
                tx = hooks_provider.before_start(
                    tx,
                    &self.id,
                ).await?
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

impl Machine {
    pub async fn start(
        db: crate::Db,
        hooks: crate::MachineHooksList,
        machine_id: &crate::DbId,
    ) -> Result<xactor::Addr<Machine>> {
        let machine_id = machine_id.clone();
        let machine = xactor::Supervisor::start(move ||
            Machine {
                db: db.clone(),
                hooks: hooks.clone(),
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

    pub async fn reset_material_targets(&mut self, msg: ResetMaterialTargets) -> Result<()> {
        let db = self.db.clone();
        let data = self.get_data()?;

        let toolhead_materials = data.config.toolheads
            .iter()
            .map(|c| {
                (c.id.clone(), c.model.material_id.clone())
            })
            .collect::<Vec<_>>();

        // Reset the ephemeral material targets on reset data
        for (toolhead_id, material_id) in toolhead_materials.into_iter() {
            if
                msg.material_id_filter.is_none()
                || msg.material_id_filter == material_id
            {
                Toolhead::set_material(
                    &db,
                    &mut data.config,
                    &toolhead_id,
                    &material_id,
                ).await?;
            }
        }

        Ok(())
    }

    pub async fn reset_data(&mut self) -> Result<()> {
        let config_path = format!("/etc/teg/machine-{}.toml", self.id);

        let config = fs::read_to_string(config_path).await?;
        let config: MachineConfig = toml::from_str(&config)?;

        self.data = Some(MachineData::new(config));

        self.reset_material_targets(
            ResetMaterialTargets { material_id_filter: None },
        )
            .await?;

        Ok(())
    }
}
