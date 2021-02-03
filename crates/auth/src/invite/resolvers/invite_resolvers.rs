use async_graphql::*;
use chrono::prelude::*;
use crate::invite::Invite;

#[Object]
impl Invite {
    async fn id(&self) -> ID {
        (&self.id).into()
    }
    async fn is_admin(&self) -> bool {
        self.config.is_admin
    }
    async fn created_at(&self) -> DateTime<Utc> {
        self.created_at
    }
}
