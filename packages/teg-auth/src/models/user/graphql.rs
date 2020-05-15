use chrono::prelude::*;
use super::User;

#[juniper::object]
impl User {
    fn id(&self) -> juniper::ID {
        self.id.to_string().into()
    }
    fn email(&self) -> Option<&String> {
        self.email.as_ref()
    }
    fn email_verified(&self) -> bool {
        self.email_verified
    }
    fn is_admin(&self) -> bool {
        self.is_admin
    }
    fn created_at(&self) -> DateTime<Utc> {
        self.created_at
    }
    fn last_logged_in_at(&self) -> Option<DateTime<Utc>> {
        self.last_logged_in_at
    }

    fn picture(&self) -> Option<url::Url> {
        use gravatar::{ Gravatar, Default::Http404, Rating };

        let url = Gravatar::new(self.email.as_ref()?)
            .set_size(Some(150))
            .set_rating(Some(Rating::Pg))
            .set_default(Some(Http404))
            .image_url()
            .to_string();

        Some(url::Url::parse(&url).ok()?)
    }

}
