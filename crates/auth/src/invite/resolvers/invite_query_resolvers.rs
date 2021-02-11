use async_graphql::{
    FieldResult,
    Context,
    ID,
};
use teg_json_store::{ JsonRow, Record as _ };

use crate::{
    AuthContext,
};
use crate::invite::{
    Invite,
};

#[derive(async_graphql::InputObject, Default, Debug)]
pub struct InvitesInput {
    #[graphql(name="inviteID")]
    pub invite_id: Option<ID>,
}

#[derive(Default)]
pub struct InviteQuery;

#[async_graphql::Object]
impl InviteQuery {
    #[instrument(skip(self, ctx))]
    async fn invites<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        #[graphql(default)]
        input: InvitesInput,
    ) -> FieldResult<Vec<Invite>> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let invites = if let Some(invite_id) = input.invite_id {
            let invite = sqlx::query_as!(
                JsonRow,
                r#"
                    SELECT props FROM invites
                    WHERE
                        consumed = FALSE
                        AND id = ?
                "#,
                invite_id.0,
            )
                .fetch_one(db)
                .await?;

            vec![invite]
        } else {
            sqlx::query_as!(
                JsonRow,
                r#"
                    SELECT props FROM invites WHERE consumed = FALSE
                "#,
            )
                .fetch_all(db)
                .await?
        };

        let mut invites = Invite::from_rows(invites)?;

        invites.sort_by_cached_key(|invite| {
            let name = &invite.config.name;
            (name.is_none(), name.clone(), invite.created_at)
        });

        Ok(invites)
    }
}
