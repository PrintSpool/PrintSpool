use chrono::prelude::*;
use async_graphql::{
    FieldResult,
    ID,
};
// use eyre::{
//     // eyre,
//     Result,
//     // Context as _,
// };
use teg_config_form::ConfigForm;

use crate::user::User;

#[async_graphql::Object]
impl User {
    async fn id(&self) -> ID {
        (&self.id).into()
    }

    /// Either the user's email address if the user has one or another uniquely identifying
    /// description for the user.
    async fn description(&self) -> String {
        if self.is_local_http_user {
            "Local HTTP User".to_string()
        } else {
            self.email.clone().unwrap_or_else(|| format!("User {}", self.id))
        }
    }

    async fn email(&self) -> Option<&String> {
        self.email.as_ref()
    }

    async fn email_verified(&self) -> bool {
        self.email_verified
    }

    async fn is_admin(&self) -> bool {
        self.config.is_admin
    }

    #[graphql(name = "isLocalHTTPUser")]
    async fn is_local_http_user(&self) -> bool {
        self.is_local_http_user
    }

    async fn created_at(&self) -> DateTime<Utc> {
        self.created_at
    }

    async fn last_logged_in_at(&self) -> Option<DateTime<Utc>> {
        self.last_logged_in_at
    }

    async fn picture(&self) -> Option<url::Url> {
        use gravatar::{ Gravatar, Default::Http404, Rating };

        let url = Gravatar::new(self.email.as_ref()?)
            .set_size(Some(150))
            .set_rating(Some(Rating::Pg))
            .set_default(Some(Http404))
            .image_url()
            .to_string();

        Some(url::Url::parse(&url).ok()?)
    }

    async fn config_form(&self) -> FieldResult<ConfigForm> {
        let config_form = teg_config_form::into_config_form(self)?;
        Ok(config_form)
    }
}
