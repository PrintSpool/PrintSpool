use chrono::prelude::*;
use eyre::{
    // eyre,
    Result,
    // Context as _,
};

use teg_json_store::Record;
use teg_machine::{MachineHooks, machine::MachineData, config::MachineConfig, machine::Machine, plugins::Plugin, task::Task};

use crate::{PrintQueue, insert_print, machine_print_queue::MachinePrintQueue, part::Part};

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
        mut tx: sqlx::Transaction<'c, sqlx::Sqlite>,
        machine_config: &mut MachineConfig,
    ) -> Result<sqlx::Transaction<'c, sqlx::Sqlite>> {
        self.create_default_print_queue(&mut tx, &machine_config.id).await?;
        Ok(tx)
    }

    async fn after_create(
        &self,
        _machine_id: &crate::DbId,
    ) -> Result<()> {
        Ok(())
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

    async fn after_plugin_update(
        &self,
        _machine_id: &crate::DbId,
        _plugin: &Plugin,
    ) -> Result<()> {
        Ok(())
    }

    async fn before_task_settle<'c>(
        &self,
        tx: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
        machine_data: &MachineData,
        machine_addr: xactor::Addr<Machine>,
        task: &mut Task,
    ) -> Result<()> {
        if
            machine_data.config.core_plugin()?.model.automatic_printing
            && task.status.was_successful()
            && task.is_print()
        {
            let next_part = Part::fetch_next_part(
                &mut *tx,
                &task.machine_id,
            ).await?;

            if let Some(next_part) = next_part {
                // Start the print
                let (_, fut) = insert_print(
                    &mut *tx,
                    &task.machine_id,
                    machine_addr,
                    next_part,
                    true,
                ).await?;

                let _ = async_std::task::spawn(fut);
            }
        }

        Ok(())
    }
}
