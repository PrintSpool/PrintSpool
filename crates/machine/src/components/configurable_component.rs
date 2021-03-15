use crate::components::ComponentInner;

impl<M, E> teg_config_form::Configurable<M> for ComponentInner<M, E>
where
    M: teg_config_form::Model,
    E: Default,
{
    fn id(&self) -> async_graphql::ID {
        format!("component-{}", self.id).into()
    }

    fn model(&self) -> &M {
        &self.model
    }

    fn model_version(&self) -> i32 {
        self.model_version
    }
}
