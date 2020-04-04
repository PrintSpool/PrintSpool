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
