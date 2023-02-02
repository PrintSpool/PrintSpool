use super::{GCodeHistoryEntry, Machine, MachineStatus, PositioningUnits};
use crate::{Db, DbId, Deletion};
use async_graphql::{dataloader::*, Context};
use bonsaidb::core::define_basic_mapped_view;
use bonsaidb::core::document::CollectionDocument;
use bonsaidb::core::schema::Collection;
#[allow(unused)]
use chrono::prelude::*;
use chrono::{DateTime, Utc};
use derive_new::new;
use eyre::Result;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize, Collection, Clone, new)]
#[collection(name = "machine_states", views = [], natural_id = |entry: Self| entry.machine_id)]
pub struct MachineState {
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    #[new(default)]
    pub deleted_at: Option<DateTime<Utc>>,

    // Foreign Keys
    pub machine_id: DbId<Machine>,

    // Top-level ephemeral machine data
    #[new(default)]
    pub status: MachineStatus,
    #[new(default)]
    pub motors_enabled: bool,
    #[new(value = "true")]
    pub absolute_positioning: bool,
    #[new(default)]
    pub positioning_units: PositioningUnits,
    #[new(default)]
    pub blocked_at: Option<DateTime<Utc>>,
    #[new(default)]
    pub gcode_history: VecDeque<GCodeHistoryEntry>,
}

define_basic_mapped_view!(
    MachineStateByMachine,
    MachineState,
    0,
    "by-machine",
    (Deletion, DbId<Machine>, DbId<MachineState>),
    |document: CollectionDocument<MachineState>| {
        let c = document.contents;
        document
            .header
            .emit_key((c.deleted_at.into(), c.machine_id))
    }
);

pub struct MachineStateLoader {
    pub db: Db,
}

#[async_trait::async_trait]
impl Loader<(Deletion, DbId<Machine>)> for MachineStateLoader {
    type Value = MachineState;
    type Error = Arc<eyre::Error>;

    async fn load(
        &self,
        keys: &[(Deletion, DbId<Machine>)],
    ) -> Result<HashMap<u64, Self::Value>, Self::Error> {
        let components = MachineStateByMachine::entries(&self.db)
            .with_keys(keys.clone())
            .query_with_collection_docs()
            .await?
            .into_iter()
            .map(|m| (m.document.id, m.document.contents))
            .collect();

        Ok(components)
    }
}

impl Machine {
    pub async fn load_state(&self, ctx: &Context<'_>) -> Result<MachineState> {
        let loader = ctx.data_unchecked::<DataLoader<MachineStateLoader>>();
        let state = loader.load_one((self.deleted_at.into(), self.id)).await?;
        Ok(state)
    }
}
