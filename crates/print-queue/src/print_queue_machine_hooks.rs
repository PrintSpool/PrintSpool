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

impl PrintQueueMachineHooks {
    pub async fn create_default_print_queue<'c>(
        &self,
        tx: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
        id: &crate::DbId,
    ) -> Result<()> {
        let now = Utc::now();
        let print_queue = PrintQueue {
            id: nanoid!(11),
            version: 0,
            created_at: now,
            deleted_at: None,
            name: "Default Print Queue".to_string(),
        };

        print_queue.insert_no_rollback(tx).await?;

        MachinePrintQueue {
            id: nanoid!(11),
            version: 0,
            created_at: now,
            deleted_at: None,
            machine_id: id.clone(),
            print_queue_id: print_queue.id.clone(),
        }
            .insert_no_rollback(tx)
            .await?;

        Ok(())
    }
}

#[async_trait::async_trait]
impl MachineHooks for PrintQueueMachineHooks {
    async fn before_create<'c>(
        &self,
        tx: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
        machine_config: &mut MachineConfig,
    ) -> Result<()> {
        self.create_default_print_queue(tx, &machine_config.id).await
    }

    async fn before_start<'c>(
        &self,
        mut tx: sqlx::Transaction<'c, sqlx::Sqlite>,
        id: &crate::DbId,
    ) -> Result<sqlx::Transaction<'c, sqlx::Sqlite>> {
        // This handles the scenario in which a machine is added by copying a config file
        // into the machines directory. It's not the normal way machines are created but it is
        // supported here to make resetting the development database easier.
        let has_print_queue = sqlx::query!(
            r#"
                SELECT id from machine_print_queues
                WHERE machine_id = ?
            "#,
            id,
        )
            .fetch_optional(&mut tx)
            .await?
            .is_some();

        if !has_print_queue {
            self.create_default_print_queue(&mut tx, &id).await?
        }

        Ok(tx)
    }
}
