use serde::Serialize;
use schemars::JsonSchema;

pub trait Configurable<M: JsonSchema + Serialize> {
    fn id(&self) -> async_graphql::ID;
    fn model(&self) -> &M;
    fn model_version(&self) -> i32;
    fn form(all_fields: &Vec<String>) -> Vec<String>;
}
