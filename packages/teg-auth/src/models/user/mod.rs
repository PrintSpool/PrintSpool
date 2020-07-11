use async_graphql::*;
use anyhow::{anyhow, Result};

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
        Self::scan(db).await
            .try_fold(0, |acc, user| {
                user.map(|user| acc + (user.is_admin as i32) )
            })
    }

    pub async fn all(context: &crate::Context) -> FieldResult<Vec<Self>> {
        context.authorize_admins_only()?;

        let users = Self::scan(&context.db)
            .await
            .collect::<Result<Vec<Self>>>()?;

        Ok(users)
    }

    pub async fn update(context: &crate::Context, changeset: UpdateUser) -> FieldResult<Self> {
        context.authorize_admins_only()?;

        let mut user = Self::get(&changeset.user_id, &context.db).await?;

        let admin_count = Self::admin_count(&context.db).await?;

        if user.is_admin && changeset.is_admin == Some(false) && admin_count == 1 {
            Err(anyhow!("Cannot remove admin access. Machines must have at least one admin user"))?
        };

        if let Some(is_admin) = changeset.is_admin {
            user.is_admin = is_admin
        }

        let user = user.insert(&context.db).await?;

        Ok(user)
    }

    pub async fn delete(context: &crate::Context, user_id: ID) -> FieldResult<Option<bool>> {
        let self_deletion = context.current_user
            .as_ref()
            .map(|current_user| current_user.id == user_id)
            .unwrap_or(false);

        if !self_deletion {
            context.authorize_admins_only()?;
        };

        let admin_count = Self::admin_count(&context.db).await?;

        let user = Self::get(&user_id, &context.db).await?;

        if user.is_admin && admin_count == 1 {
            Err(anyhow!("Cannot delete only admin user"))?
        };

        context.db.remove(Self::key(&user_id))?;

        Ok(None)
    }
}
