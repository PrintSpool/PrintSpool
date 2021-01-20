use async_graphql::{
    FieldResult,
    Context,
    // ID,
};
use teg_json_store::Record as _;

use crate::{
    AuthContext,
};
use crate::invite::{
    Invite,
};

pub struct Query();

#[async_graphql::Object]
impl Query {
    async fn invites<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<Invite>> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        // TODO: order the invites by their ids
        let invites = Invite::get_all(db).await?;

        Ok(invites)
    }
}
