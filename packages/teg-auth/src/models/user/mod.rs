use chrono::prelude::*;
use juniper::{
    FieldResult,
    FieldError,
    ID,
};

use crate::{ Context };

mod authenticate;
pub use authenticate::*;

pub mod jwt;

mod graphql;

#[derive(Debug)]
pub struct User {
    // TODO: investigate how to add custom result exts to slqx
    // pub id: ID,
    // pub id: String,
    pub id: i32,
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

impl User {
    pub async fn all(context: &Context) -> FieldResult<Vec<User>> {
        context.authorize_admins_only()?;

        let users = sqlx::query_as!(
            User,
            "SELECT * FROM users ORDER BY id",
        )
            .fetch_all(&mut context.db().await?)
            .await?;

        Ok(users)
    }

    pub async fn update(context: &Context, user: UpdateUser) -> FieldResult<User> {
        context.authorize_admins_only()?;
        let mut db = context.db().await?;

        let db_user = sqlx::query_as!(
            User,
            "
                SELECT * FROM users
                WHERE id=$1
            ",
            user.user_id.parse::<i32>()?
        )
            .fetch_one(&mut db)
            .await?;

        let admin_count = sqlx::query!(
            "SELECT COUNT(id) FROM users AS count WHERE is_admin=True"
        )
        .fetch_one(&mut db)
        .await?
        .count;

        if db_user.is_admin && user.is_admin == Some(false) && admin_count == 1 {
            let msg = "Cannot remove admin access. Machines must have at least one admin user";

            return Err(FieldError::new(
                msg,
                graphql_value!({
                    "internal_error": msg
                }),
            ));
        };

        let next_user = sqlx::query_as!(
            User,
            "
                UPDATE users
                SET is_admin=$2
                WHERE id=$1
                RETURNING *
            ",
            user.user_id.parse::<i32>()?,
            user.is_admin.unwrap_or(db_user.is_admin)
        )
            .fetch_one(&mut db)
            .await?;

        Ok(next_user)
    }

    pub async fn delete(context: &Context, user_id: String) -> FieldResult<Option<bool>> {
        eprintln!("{:?}", user_id);
        let mut db = context.db().await?;
        let user_id = user_id.parse::<i32>()?;

        let self_deletion = context.current_user
            .as_ref()
            .map(|current_user| current_user.id == user_id)
            .unwrap_or(false);
        eprintln!("{:?} == {:?} = {:?}", user_id, context.current_user, self_deletion);

        if !self_deletion {
            context.authorize_admins_only()?;
        };

        let admin_count = sqlx::query!(
            "SELECT COUNT(id) FROM users AS count WHERE is_admin=True"
        )
        .fetch_one(&mut db)
        .await?
        .count;

        let admin_deletion= sqlx::query!(
            "SELECT is_admin FROM users WHERE id=$1",
            user_id
        )
        .fetch_one(&mut db)
        .await?
        .is_admin;

        if admin_deletion && admin_count == 1 {
            return Err(FieldError::new(
                "Cannot delete only admin user",
                graphql_value!({ "internal_error": "Cannot delete only admin user" }),
            ))
        };

        let _ = sqlx::query!(
            "DELETE FROM users WHERE id=$1",
            user_id
        )
        .execute(&mut db)
        .await?;

        Ok(None)
    }
}
