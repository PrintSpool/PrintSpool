use juniper::{
    FieldResult,
};

use crate::{ Context };

mod authenticate;

pub use authenticate::*;

#[derive(Debug, juniper::GraphQLObject)]
pub struct User {
    pub id: i32,
    pub name: Option<String>,
    pub email: Option<String>,
    pub email_verified: bool,
    pub is_admin: bool,

    #[graphql(skip)]
    pub user_profile_id: String,
    #[graphql(skip)]
    pub is_authorized: bool,
}

#[derive(juniper::GraphQLInputObject)]
pub struct UpdateUser {
    pub id: String,
    pub is_admin: bool,
}

impl User {
    pub async fn all(context: &Context) -> FieldResult<Vec<User>> {
        context.authorize_admins_only()?;

        let users = sqlx::query_as!(
            User,
            "SELECT * FROM users",
        )
            .fetch_all(&mut context.db().await?)
            .await?;

        Ok(users)
    }

    pub async fn remove(context: &Context, user_id: String) -> FieldResult<Option<bool>> {
        println!("{:?}", user_id);
        let user_id = user_id.parse::<i32>()?;

        let self_deletion = context.current_user
            .as_ref()
            .map(|current_user| current_user.id == user_id)
            .unwrap_or(false);
        println!("{:?} == {:?} = {:?}", user_id, context.current_user, self_deletion);

        if !self_deletion {
            context.authorize_admins_only()?;
        };

        let _ = sqlx::query!(
            "DELETE FROM users WHERE id=$1",
            user_id
        )
        .fetch_optional(&mut context.db().await?)
        .await?;

        Ok(None)
    }

    pub async fn update(context: &Context, user: UpdateUser) -> FieldResult<User> {
        context.authorize_admins_only()?;

        let next_user = sqlx::query_as!(
            User,
            "
                UPDATE users
                SET is_admin=COALESCE($2, is_admin)
                WHERE id=$1
                RETURNING *
            ",
            user.id.parse::<i32>()?,
            user.is_admin
        )
            .fetch_one(&mut context.db().await?)
            .await?;

        Ok(next_user)
    }
}
