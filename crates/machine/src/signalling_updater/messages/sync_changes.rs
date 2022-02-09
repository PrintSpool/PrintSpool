// use eyre::{
//     eyre,
//     Result,
//     Context as _,
// };
// use rand::Rng;
// use async_std::future;
use serde::{Deserialize, Serialize};
// use surf::http::auth::{AuthenticationScheme, Authorization};
// use printspool_json_store::Record as _;

use super::super::{
    SignallingUpdater,
    // MachineSignallingUpdate,
    // MachineUpdateOperation,
};

#[xactor::message(result = "()")]
#[derive(Clone)]
pub struct SyncChanges;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphQLResponse {
    errors: Option<serde_json::Value>,
    data: serde_json::Value,
}

// TODO: Delete sync changes - machine lists are now entirely local to the server
#[async_trait::async_trait]
impl xactor::Handler<SyncChanges> for SignallingUpdater {
    async fn handle(
        &mut self,
        ctx: &mut xactor::Context<Self>,
        _msg: SyncChanges,
    ) -> () {
        ctx.abort_intervals();

        // let result = async move {
        //     let updates = MachineSignallingUpdate::get_all(&self.db, false)
        //         .await?;

        //     if updates.is_empty() {
        //         return Ok(())
        //     }

        //     let register_machines_json = updates
        //         .iter()
        //         .filter_map(|update| {
        //             if let MachineUpdateOperation::Register { name } = &update.operation {
        //                 Some(serde_json::json!({
        //                     "slug": update.machine_id,
        //                     "name": name,
        //                 }))
        //             } else {
        //                 None
        //             }
        //         })
        //         .collect::<Vec<_>>();

        //     let delete_slugs_json = updates
        //         .iter()
        //         .filter_map(|update| {
        //             if let MachineUpdateOperation::Delete = &update.operation {
        //                 Some(&update.machine_id)
        //             } else {
        //                 None
        //             }
        //         })
        //         .collect::<Vec<_>>();

        //     let json = serde_json::json!({
        //         "query": r#"
        //             mutation syncChanges(
        //                 $register: RegisterMachinesInput!
        //                 $delete: DeleteMachinesInput!
        //             ) {
        //                 registerMachinesFromHost(input: $register) {
        //                     id
        //                 }
        //                 deleteMachinesFromHost(input: $delete) {
        //                     id
        //                 }
        //             }
        //         "#.to_string(),
        //         "variables": {
        //             "register": {
        //                 "machines": register_machines_json,
        //             },
        //             "delete": {
        //                 "machineSlugs": delete_slugs_json,
        //             },
        //         },
        //     });

        //     let url = std::env::var("SIGNALLING_SERVER_HTTP")?;

        //     let jwt = self.server_keys.create_signalling_jwt()?;
        //     let identity_public_key = &self.server_keys.identity_public_key;

        //     let scheme = AuthenticationScheme::Bearer;
        //     let bearer_auth = Authorization::new(scheme, jwt.into());

        //     info!("KEY: {:?}", identity_public_key);
        //     let req = surf::post(url)
        //         .body(json)
        //         .header(bearer_auth.name(), bearer_auth.value())
        //         .header(
        //             "X-Host-Identity-Public-Key",
        //             base64::encode(identity_public_key),
        //         )
        //         // .map_err(|err| eyre!(err))? // TODO: Remove me when surf 2.0 is released
        //         .recv_json();

        //     let res: GraphQLResponse = future::timeout(
        //         std::time::Duration::from_millis(5_000),
        //         req,
        //     )
        //         .await
        //         .wrap_err("Timed out")?
        //         .map_err(|err| eyre!(err))?; // TODO: Remove me when surf 2.0 is released

        //     if let Some(errors) = res.errors {
        //         return Err(eyre!(format!("GraphQL Errors: {:?}", errors)))
        //     }

        //     for mut update in updates {
        //         update.remove_if_unchanged(&self.db, true).await?;
        //     }

        //     Result::<_>::Ok(())
        // }.await;

        // if let Err(err) = result {
        //     warn!("Unable to synchronize with signalling, may be offline: {:?}", err);

        //     let mut rng = rand::thread_rng();
        //     ctx.send_interval(
        //         SyncChanges,
        //         std::time::Duration::from_secs(rng.gen_range(5, 10)),
        //     )
        // };
    }
}
