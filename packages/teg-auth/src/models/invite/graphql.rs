use chrono::prelude::*;
use super::Invite;

#[juniper::object]
impl Invite {
    fn id(&self) -> juniper::ID {
        self.id.to_string().into()
    }
    fn public_key(&self) -> &String {
        &self.public_key
    }
    fn is_admin(&self) -> bool {
        self.is_admin
    }
    fn created_at(&self) -> DateTime<Utc> {
        self.created_at
    }
}
