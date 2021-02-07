use chrono::prelude::*;
use eyre::{
    // eyre,
    Result,
    // Context as _,
};

use teg_json_store::Record;
use teg_machine::{
    config::MachineConfig,
    MachineHooks,
};

use crate::{PrintQueue, machine_print_queue::MachinePrintQueue};

pub struct PrintQueueMachineHooks;

#[async_trait::async_trait]
impl MachineHooks for PrintQueueMachineHooks {
    async fn before_create<'c>(
        &self,
        tx: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
        machine_config: &mut MachineConfig,
    ) -> Result<()> {
        let now = Utc::now();
        let print_queue = PrintQueue {
            id: nanoid!(11),
            version: 0,
            created_at: now.clone(),
            deleted_at: None,
            name: "Default Print Queue".to_string(),
        };

        print_queue.insert_no_rollback(tx).await?;

        MachinePrintQueue {
            id: nanoid!(11),
            version: 0,
            created_at: now.clone(),
            deleted_at: None,
            machine_id: machine_config.id.clone(),
            print_queue_id: print_queue.id.clone(),
        }
            .insert_no_rollback(tx)
            .await?;

        Ok(())
    }
}
