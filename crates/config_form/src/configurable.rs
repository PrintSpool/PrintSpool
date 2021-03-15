use crate::Model;

pub trait Configurable<M: Model> {
    fn id(&self) -> async_graphql::ID;
    fn model(&self) -> &M;
    fn model_version(&self) -> i32;

    fn form(all_fields: &Vec<String>) -> Vec<String> {
        M::form(all_fields)
    }
}
