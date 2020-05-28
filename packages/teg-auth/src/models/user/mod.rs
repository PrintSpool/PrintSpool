use chrono::prelude::*;
use juniper::{
    FieldResult,
    FieldError,
    ID,
};
use serde::{Deserialize, Serialize};

use crate::{ Context, ResultExt };

mod authenticate;
pub use authenticate::*;

pub mod jwt;

mod graphql;

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: ID,
    pub email: Option<String>,
    pub email_verified: bool,
    pub is_admin: bool,
    pub created_at: DateTime<Utc>,
    pub last_logged_in_at: Option<DateTime<Utc>>,

    pub firebase_uid: String,
    pub is_authorized: bool,
}

#[derive(juniper::GraphQLInputObject)]
pub struct UpdateUser {
    #[graphql(name="userID")]
    pub user_id: ID,
    pub is_admin: Option<bool>,
}

#[derive(juniper::GraphQLInputObject)]
pub struct DeleteUser {
    #[graphql(name="userID")]
    pub user_id: ID,
}

const DB_PREFIX: &str = "users";

impl User {
    pub fn key(user_id: &ID) -> String {
        format!("{}:{}", DB_PREFIX, user_id.to_string())
    }

    pub fn generate_id(db: &sled::Db) -> crate::Result<ID> {
        db.generate_id()
            .map(|id| format!("{:64}", id).into())
            .chain_err(|| "Error generating invite id")
    }

    pub async fn get(user_id: &ID, db: &sled::Db) -> crate::Result<Self> {
        let iv_vec = db.get(Self::key(user_id))
            .chain_err(|| "Unable to get user")?
            .ok_or(format!("User {:?} not found", user_id))?;

        let user = serde_cbor::from_slice(iv_vec.as_ref())
            .chain_err(|| "Unable to deserialize user in User::get")?;

        Ok(user)
    }

    pub async fn insert(self: &Self, db: &sled::Db) -> crate::Result<()> {
        let bytes = serde_cbor::to_vec(self)
            .chain_err(|| "Unable to deserialize user in User::get")?;

        db.insert(Self::key(&self.id), bytes)
            .chain_err(|| "Unable to insert user")?;

        Ok(())
    }

    pub async fn scan(db: &sled::Db) -> impl Iterator<Item = crate::Result<Self>> {
        db.scan_prefix(&DB_PREFIX)
            .values()
            .map(|iv_vec: sled::Result<sled::IVec>| {
                iv_vec
                    .chain_err(|| "Error scanning all users")
                    .and_then(|iv_vec| {
                        serde_cbor::from_slice(iv_vec.as_mut())
                            .chain_err(|| "Unable to deserialize user in User::scan")
                    })
            })
    }

    pub async fn admin_count(db: &sled::Db) -> crate::Result<i32> {
        Self::scan(db).await
            .try_fold(0, |acc, user| {
                user.map(|user| acc + (user.is_admin as i32) )
            })
    }

    pub async fn all(context: &Context) -> FieldResult<Vec<Self>> {
        context.authorize_admins_only()?;

        let users = Self::scan(&context.db)
            .await
            .collect::<crate::Result<Vec<Self>>>()?;

        Ok(users)
    }

    pub async fn update(context: &Context, changeset: UpdateUser) -> FieldResult<Self> {
        context.authorize_admins_only()?;

        let user = Self::get(&changeset.user_id, &context.db).await?;

        let admin_count = Self::admin_count(&context.db).await?;

        if user.is_admin && changeset.is_admin == Some(false) && admin_count == 1 {
            let msg = "Cannot remove admin access. Machines must have at least one admin user";

            return Err(FieldError::new(
                msg,
                graphql_value!({
                    "internal_error": msg
                }),
            ));
        };

        if let Some(is_admin) = changeset.is_admin {
            user.is_admin = is_admin
        }

        user.insert(&context.db).await?;

        Ok(user)
    }

    pub async fn delete(context: &Context, user_id: ID) -> FieldResult<Option<bool>> {
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
            return Err(FieldError::new(
                "Cannot delete only admin user",
                graphql_value!({ "internal_error": "Cannot delete only admin user" }),
            ))
        };

        context.db.remove(Self::key(&user_id));

        Ok(None)
    }
}
