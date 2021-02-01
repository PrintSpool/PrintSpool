// use std::sync::Arc;
// use arc_swap::ArcSwap;
// use async_std::task;
// use eyre::{
//     // eyre,
//     Context as _,
//     Result,
// };
// use futures_util::future::Future;

// use crate::user::jwt;

// // Firebase Certs
// pub async fn watch_pem_keys(
// ) -> Result<(Arc<ArcSwap<Vec<Vec<u8>>>>, impl Future<Output = Result<()>>)> {
//     let pem_keys = async {
//         // Retry until the PEM keys are downloaded successfully
//         loop {
//             match jwt::get_pem_keys().await {
//                 Ok(pem_keys) => return pem_keys,
//                 Err(err) => warn!("{:?}", err),
//             };
//             task::sleep(std::time::Duration::from_millis(500)).await;
//         };
//     }.await;
//     let pem_keys = Arc::new(ArcSwap::new(Arc::new(pem_keys)));

//     let pem_keys_clone = pem_keys.clone();
//     let refresh_task = async move {
//         loop {
//             info!("Firebase certs will refresh in an hour");
//             task::sleep(std::time::Duration::from_secs(60 * 60)).await;

//             let next_pem_keys = jwt::get_pem_keys()
//                 .await
//                 .with_context(|| "Unable to refresh Firebase certs")?;

//             pem_keys_clone.store(Arc::new(next_pem_keys));
//         }
//     };

//     Ok((pem_keys, refresh_task))
// }
