use chrono::prelude::*;
use chrono::Duration;
use eyre::{
    // eyre,
    // Context as _,
    Result,
};

impl super::ServerKeys {
    pub fn create_signalling_jwt(
        &self,
        graphql_ws_url: &str,
    ) -> Result<String> {

        let jwt_headers = serde_json::json!({
        });

        let jwt_payload = serde_json::json!({
            "sub": "self",
            "aud": graphql_ws_url.clone(),
            "exp": (Utc::now() + Duration::minutes(10)).timestamp(),
            "selfSignature": true,
        });

        let jwt = frank_jwt::encode(
            jwt_headers,
            &self.identity_private_key,
            &jwt_payload,
            frank_jwt::Algorithm::ES256,
        )?;

        Ok(jwt)
    }
}
