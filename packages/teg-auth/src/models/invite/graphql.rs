use async_graphql::*;
use chrono::prelude::*;
use super::Invite;

#[Object]
impl Invite {
    async fn id(&self) -> ID {
        self.id.into()
    }
    async fn public_key(&self) -> &String {
        &self.public_key
    }
    async fn is_admin(&self) -> bool {
        self.is_admin
    }
    async fn created_at(&self) -> DateTime<Utc> {
        self.created_at
    }
}
