use chrono::prelude::*;
use async_graphql::{
    // FieldResult,
    ID,
};
// use anyhow::{
//     anyhow,
//     Result,
//     Context as _,
// };

use super::User;

#[async_graphql::Object]
impl User {
    async fn id(&self) -> ID {
        self.id.into()
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


    // TODO: integrate these functions into config mutations once those are a thing
    // --------------------------------

    // pub async fn update(ctx: &Arc<crate::Context>, changeset: UpdateUser) -> FieldResult<Self> {
    //     ctx.authorize_admins_only()?;

    //     let user_id = changeset.user_id;
    //     let user_id = user_id.parse()
    //         .with_context(|| format!("Invalid user_id: {:?}", user_id))?;

    //     let mut user = Self::get(&ctx.db, user_id)?;

    //     let admin_count = Self::admin_count(&ctx.db).await?;

    //     if user.is_admin && changeset.is_admin == Some(false) && admin_count == 1 {
    //         Err(anyhow!("Cannot remove admin access. Machines must have at least one admin user"))?
    //     };

    //     if let Some(is_admin) = changeset.is_admin {
    //         user.is_admin = is_admin
    //     }

    //     let user = user.insert(&ctx.db)?;

    //     Ok(user)
    // }

    // pub async fn delete(ctx: &Arc<crate::Context>, user_id: ID) -> FieldResult<Option<bool>> {
    //     let user_id = user_id.parse()
    //         .with_context(|| format!("Invalid user id: {:?}", user_id))?;

    //     let self_deletion = ctx.current_user
    //         .as_ref()
    //         .map(|current_user| current_user.id == user_id)
    //         .unwrap_or(false);

    //     if !self_deletion {
    //         ctx.authorize_admins_only()?;
    //     };

    //     let admin_count = Self::admin_count(&ctx.db).await?;

    //     let user = Self::get(&ctx.db, user_id)?;

    //     if user.is_admin && admin_count == 1 {
    //         Err(anyhow!("Cannot delete only admin user"))?
    //     };

    //     ctx.db.remove(Self::key(user_id))?;

    //     Self::flush(&ctx.db).await?;

    //     Ok(None)
    // }
}
