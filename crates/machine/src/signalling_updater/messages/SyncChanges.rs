use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use async_graphql::{
    ID,
};
use rand::Rng;

use super::super::SignallingUpdater;
use super::MachineSignallingUpdateRow;

#[xactor::message(result = "()")]
pub struct SyncChanges;

#[async_trait::async_trait]
impl xactor::Handler<SyncChanges> for SignallingUpdater {
    async fn handle(
        &mut self,
        ctx: &mut xactor::Context<Self>,
        msg: SyncChanges,
    ) -> Result<()> {
        let result = async move {
            let updates = MachineSignallingUpdateRow::get_all(&self.db, false)
                .await?;

            let register_machines_json = updates
                .iter()
                .filter_map(|update| {
                    if let MachineUpdateOperation::Register { name } = update.operation {
                        Some(serde_json::json!({
                            "slug": update.machine_id,
                            "name": name,
                        }))
                    } else {
                        None
                    }
                })
                .collect::<Vec<_>>();

            let delete_slugs_json = updates
                .iter()
                .filter_map(|update| {
                    if let MachineUpdateOperation::Delete = update.operation {
                        Some(update.machine_id)
                    } else {
                        None
                    }
                })
                .collect::<Vec<_>>();

            let json = serde_json::json!({
                "query": r#"
                    mutation syncChanges(
                        $register: RegisterMachinesInput!
                        $delete: DeleteMachinesInput!
                    ) {
                        registerMachinesFromHost(input: $register) {
                            id
                        }
                        deleteMachinesFromHost(input: $delete) {
                            id
                        }
                    }
                "#.to_string(),
                "variables": {
                    "register": {
                        "machines": register_machines_json,
                    },
                    "delete": {
                        "machineSlugs": delete_slugs_json,
                    },
                },
            });

            let url = std::env::var("SIGNALLING_SERVER_HTTP")?;

            // let jwt = TODO
            // let identity_public_key = TODO

            let req = surf::post(url)
                .body(json)
                .header("authorization", format!("bearer {}", jwt))
                .header("x-host-identity-public-key", identity_public_key)
                .query(&dbg!(VideoCallQueryParams {
                    peerid: &video_session_id,
                    url: &video.model.source,
                    options: "rtptransport=tcp&timeout=60",
                }))
                .map_err(|err| eyre!(err))? // TODO: Remove me when surf 2.0 is released
                .recv_json();

            let answer = future::timeout(std::time::Duration::from_millis(5_000), req)
                .await
                .wrap_err("Timed out")?
                .map_err(|err| eyre!(err))?; // TODO: Remove me when surf 2.0 is released

            if (res.status() != 200) {
                return Err(eyre!(format!("Received non-200 status code: {:?}", res.status())))
            }

            Result::<_>::Ok(())
        }.await;

        if let Err(err) = result {
            warn!("Unable to synchronize with signalling, may be offline: {:?}", err);

            let mut rng = rand::thread_rng();
            ctx.send_later(SyncChanges, Duration::from_secs(rng.gen_range(5..10)))
        }

        Ok(())
    }
}
