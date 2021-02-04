use async_graphql::{
    FieldResult,
    Context,
    // ID,
};
use teg_json_store::{ JsonRow, Record as _ };

use crate::{
    AuthContext,
};
use crate::invite::{
    Invite,
};

#[derive(Default)]
pub struct InviteQuery;

#[async_graphql::Object]
impl InviteQuery {
    async fn invites<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<Invite>> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        // TODO: order the invites by their ids
        let invites = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT props FROM invites WHERE consumed = FALSE
            "#,
        )
            .fetch_all(db)
            .await?;

        let invites = Invite::from_rows(invites)?;

        Ok(invites)
    }
}
