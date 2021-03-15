use super::{
    User,
    UserConfig,
};

impl teg_config_form::Configurable<UserConfig> for User
{
    fn id(&self) -> async_graphql::ID {
        format!("user-{}", self.id).into()
    }


    fn model(&self) -> &UserConfig {
        &self.config
    }

    fn model_version(&self) -> i32 {
        self.version
    }
}

impl teg_config_form::Model for UserConfig
{
    fn form(all_fields: &Vec<String>) -> Vec<String> {
        all_fields.clone()
    }
}
