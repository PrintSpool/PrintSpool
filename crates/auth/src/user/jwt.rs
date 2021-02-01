// use std::{collections::HashMap, sync::Arc};
// use std::time::Duration;
// use serde::Deserialize;
// use async_std::future;
// use eyre::{
//     eyre,
//     Context as _,
//     Result,
// };
// use arc_swap::ArcSwap;
// use frank_jwt::{Algorithm, ValidationOptions, decode};

// // decode the JWT with the matching signing key and validate the payload
// #[derive(Deserialize, Debug)]
// pub struct JWTPayload {
//     pub sub: String,
//     pub aud: String,
//     pub email: String,
//     pub email_verified: bool,
// }

// use openssl::x509::X509;

// pub async fn get_pem_keys() -> Result<Vec<Vec<u8>>> {
//     info!("Downloading Firebase Certs");

//     // get the latest signing keys
//     let uri = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

//     let req = surf::get(uri)
//         .recv_json();

//     let pem_keys: HashMap<String, String> = future::timeout(
//         Duration::from_millis(5_000),
//         req,
//     )
//         .await
//         .with_context(|| "Timedout fetching google PEM keys")?
//         .map_err(|_| eyre!("Unable to parse google PEM keys json"))?;

//     let pem_keys = pem_keys
//         .values()
//         .map(|x509| {
//             let x509 = X509::from_pem(&x509[..].as_bytes())
//                 .with_context(|| "Google PEM key not found")?
//                 .public_key()
//                 .with_context(|| "Error parsing Google PEM public key")?
//                 .public_key_to_pem()?;

//             Ok(x509)
//         })
//         .collect::<Result<Vec<Vec<u8>>>>()
//         .with_context(|| "Error parsing one of google's PEM keys")?;

//     info!("Firebase Certs Updated");

//     Ok(pem_keys)
// }

// pub async fn validate_jwt(
//     auth_pem_keys: Arc<ArcSwap<Vec<Vec<u8>>>>,
//     jwt: String,
// ) -> Result<JWTPayload> {
//     let (_, payload) = auth_pem_keys.load().iter().find_map(|pem_key| {
//         decode(
//             &jwt,
//             pem_key,
//             Algorithm::RS256,
//             &ValidationOptions::default(),
//         ).ok()
//     }).ok_or(eyre!("Invalid authorization token"))?;

//     let payload: JWTPayload = serde_json::from_value(payload)
//         .with_context(|| "Invalid authorization payload")?;

//     let firebase_project_id = std::env::var("FIREBASE_PROJECT_ID")
//         .expect("$FIREBASE_PROJECT_ID must be set");

//     if payload.aud != firebase_project_id {
//         Err(eyre!("Invalid JWT Audience"))?
//     }

//     Ok(payload)
// }
