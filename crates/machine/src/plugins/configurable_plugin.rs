use super::PluginContainer;

impl<T> teg_config_form::Configurable<T> for PluginContainer<T>
where
    T: teg_config_form::Model,
{
    fn id(&self) -> async_graphql::ID {
        format!("user-{}", self.id).into()
    }

    fn model(&self) -> &T {
        &self.model
    }

    fn model_version(&self) -> i32 {
        self.model_version
    }

    fn form(all_fields: &Vec<String>) -> Vec<String> {
        T::form(all_fields)
    }
}
