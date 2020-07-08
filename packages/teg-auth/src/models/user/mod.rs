use async_graphql::*;
use anyhow::{anyhow, Context as _, Result};

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

const DB_PREFIX: &str = "users";

impl User {
    pub fn key(user_id: &ID) -> String {
        format!("{}:{}", DB_PREFIX, user_id.to_string())
    }

    pub fn generate_id(db: &sled::Db) -> Result<ID> {
        db.generate_id()
            .map(|id| format!("{:064}", id).into())
            .with_context(|| "Error generating invite id")
    }

    pub async fn get_optional(user_id: &ID, db: &sled::Db) -> Result<Option<Self>> {
        db.get(Self::key(user_id))
            .with_context(|| "Unable to get user")?
            .map(|iv_vec| {
                serde_cbor::from_slice(iv_vec.as_ref())
                    .with_context(|| "Unable to deserialize user in User::get")
            })
            .transpose()
    }

    pub async fn get(user_id: &ID, db: &sled::Db) -> Result<Self> {
        Self::get_optional(user_id, db)
            .await?
            .ok_or(anyhow!("User {:?} not found", user_id))
    }

    pub async fn insert(self: &Self, db: &sled::Db) -> Result<()> {
        let bytes = serde_cbor::to_vec(self)
            .with_context(|| "Unable to deserialize user in User::get")?;

        db.insert(Self::key(&self.id), bytes)
            .with_context(|| "Unable to insert user")?;

        Ok(())
    }

    pub async fn scan(db: &sled::Db) -> impl Iterator<Item = Result<Self>> {
        db.scan_prefix(&DB_PREFIX)
            .values()
            .map(|iv_vec: sled::Result<sled::IVec>| {
                iv_vec
                    .with_context(|| "Error scanning all users")
                    .and_then(|iv_vec| {
                        serde_cbor::from_slice(iv_vec.as_ref())
                            .with_context(|| "Unable to deserialize user in User::scan")
                    })
            })
    }

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

        user.insert(&context.db).await?;

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
