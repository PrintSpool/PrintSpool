use std::pin::Pin;

use chrono::prelude::*;
use eyre::{
    // eyre,
    Result,
    // Context as _,
};

use futures::{Future, FutureExt};
use teg_json_store::Record;
use teg_machine::{MachineHooks, MachineHooksList, config::MachineConfig, machine::Machine, machine::MachineData, plugins::Plugin, task::Task};

use crate::{PrintQueue, insert_print, machine_print_queue::MachinePrintQueue, part::Part};

pub struct PrintQueueMachineHooks {
    pub db: crate::Db,
}

impl PrintQueueMachineHooks {
    pub async fn create_default_print_queue<'c>(
        &self,
        tx: &mut sqlx::Transaction<'c, sqlx::Postgres>,
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
        mut tx: sqlx::Transaction<'c, sqlx::Postgres>,
        machine_config: &mut MachineConfig,
    ) -> Result<sqlx::Transaction<'c, sqlx::Postgres>> {
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
        mut tx: sqlx::Transaction<'c, sqlx::Postgres>,
        id: &crate::DbId,
    ) -> Result<sqlx::Transaction<'c, sqlx::Postgres>> {
        // This handles the scenario in which a machine is added by copying a config file
        // into the machines directory. It's not the normal way machines are created but it is
        // supported here to make resetting the development database easier.
        let has_print_queue = sqlx::query!(
            r#"
                SELECT id from machine_print_queues
                WHERE machine_id = $1
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
        tx: &mut sqlx::Transaction<'c, sqlx::Postgres>,
        machine_hooks: &MachineHooksList,
        machine_data: &MachineData,
        machine_addr: xactor::Addr<Machine>,
        task: &mut Task,
    ) -> Result<Option<Pin<Box<dyn Future<Output = ()> + Send>>>> {
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
                info!("Automatic Printing: Spooling next print");

                // Start the print
                let (next_task_id, parse_and_spool) = insert_print(
                    self.db.clone(),
                    &mut *tx,
                    machine_hooks,
                    &task.machine_id,
                    machine_addr,
                    next_part,
                    true,
                ).await?;

                let parse_and_spool = parse_and_spool.then(|res| async move {
                    if let Err(err) = res {
                        error!(
                            "Error parsing and spooling automatic print (ID: {:?}): {:?}",
                            next_task_id,
                            err,
                        );
                    };
                });

                // Spawn the parse and spool future asynchronously after the task is settled so
                // that it does not deadlock with the caller of this hook while attempting to call
                // the Machine actor.
                return Ok(Some(async move {
                    async_std::task::spawn(parse_and_spool);
                }.boxed()))
            }
        } else {
            info!("Automatic Printing: All prints completed!");
        }

        Ok(None)
    }
}
