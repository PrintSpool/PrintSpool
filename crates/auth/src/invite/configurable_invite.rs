use super::{
    Invite,
    InviteConfig,
};

impl teg_config_form::Configurable<InviteConfig> for Invite
{
    fn id(&self) -> async_graphql::ID {
        format!("invite-{}", self.id).into()
    }

    fn model(&self) -> &InviteConfig {
        &self.config
    }

    fn model_version(&self) -> i32 {
        self.version
    }

    fn form(all_fields: &Vec<String>) -> Vec<String> {
        all_fields.clone()
    }
}
