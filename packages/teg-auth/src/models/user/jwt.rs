use std::collections::HashMap;
use serde::Deserialize;

use frank_jwt::{Algorithm, ValidationOptions, decode};

use crate::{ ResultExt, Context };

// decode the JWT with the matching signing key and validate the payload
#[derive(Deserialize, Debug)]
pub struct JWTPayload {
    pub sub: String,
    pub aud: String,
    pub name: String,
    pub email: String,
    pub email_verified: bool,
}

use openssl::x509::X509;

pub fn get_pem_keys() -> crate::Result<Vec<Vec<u8>>> {
    info!("Downloading Firebase Certs");

    // get the latest signing keys
    let uri = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

    // let pem_keys = reqwest::get(uri)
    let pem_keys = reqwest::blocking::Client::new()
        .get(uri)
        // .await
        .send()
        .map_err(|_| "Unable to fetch google PEM keys")?
        .json::<HashMap<String, String>>()
        // .await
        .map_err(|_| "Unable to parse google PEM keys")?
        .values()
        .map(|x509| {
            X509::from_pem(&x509[..].as_bytes())
                .ok()?
                .public_key()
                .ok()?
                .public_key_to_pem()
                .ok()
        })
        .map(|result| result.expect("Unable to parse one of google's PEM keys"))
        .collect();

    info!("Firebase Certs Updated");

    Ok(pem_keys)
}

pub async fn validate_jwt(
    context: &Context,
    jwt: String,
) -> Result<JWTPayload, crate::Error> {
    let (_, payload) = context.auth_pem_keys.iter().find_map(|pem_key| {
        decode(
            &jwt,
            pem_key,
            Algorithm::RS256,
            &ValidationOptions::default(),
        ).ok()
    }).ok_or("Invalid authorization token")?;

    let payload: JWTPayload = serde_json::from_value(payload)
        .chain_err(|| "Invalid authorization payload")?;

    let firebase_project_id = std::env::var("FIREBASE_PROJECT_ID")
        .expect("$FIREBASE_PROJECT_ID must be set");

    if payload.aud != firebase_project_id {
        Err("Invalid JWT Audience")?
    }

    Ok(payload)
}
