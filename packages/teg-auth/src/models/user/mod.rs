use std::sync::Arc;
use async_graphql::*;
use anyhow::{anyhow, Result};

use crate::models::VersionedModel;

mod authenticate;
pub use authenticate::*;

pub mod jwt;

mod graphql;

mod revisions;
pub use revisions::{ User, UserDBEntry };

#[InputObject]
pub struct UpdateUser {
    #[field(name="userID")]
    pub user_id: ID,
    pub is_admin: Option<bool>,
}

#[InputObject]
pub struct DeleteUser {
    #[field(name="userID")]
    pub user_id: ID,
}

impl User {
    pub async fn admin_count(db: &sled::Db) -> Result<i32> {
        Self::scan(db)
            .try_fold(0, |acc, user| {
                user.map(|user| acc + (user.is_admin as i32) )
            })
    }

    pub async fn all(context: &Arc<crate::Context>) -> FieldResult<Vec<Self>> {
        context.authorize_admins_only()?;

        let users = Self::scan(&context.db)
            .collect::<Result<Vec<Self>>>()?;

        Ok(users)
    }

    pub async fn update(ctx: &Arc<crate::Context>, changeset: UpdateUser) -> FieldResult<Self> {
        ctx.authorize_admins_only()?;

        let mut user = Self::get(&ctx.db, &changeset.user_id)?;

        let admin_count = Self::admin_count(&ctx.db).await?;

        if user.is_admin && changeset.is_admin == Some(false) && admin_count == 1 {
            Err(anyhow!("Cannot remove admin access. Machines must have at least one admin user"))?
        };

        if let Some(is_admin) = changeset.is_admin {
            user.is_admin = is_admin
        }

        let user = user.insert(&ctx.db)?;

        Ok(user)
    }

    pub async fn delete(ctx: &Arc<crate::Context>, user_id: ID) -> FieldResult<Option<bool>> {
        let self_deletion = ctx.current_user
            .as_ref()
            .map(|current_user| current_user.id == user_id)
            .unwrap_or(false);

        if !self_deletion {
            ctx.authorize_admins_only()?;
        };

        let admin_count = Self::admin_count(&ctx.db).await?;

        let user = Self::get(&ctx.db, &user_id)?;

        if user.is_admin && admin_count == 1 {
            Err(anyhow!("Cannot delete only admin user"))?
        };

        ctx.db.remove(Self::key(&user_id)?)?;

        Self::flush(&ctx.db).await?;

        Ok(None)
    }
}
