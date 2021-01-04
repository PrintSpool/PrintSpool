#[derive(async_graphql::SimpleObject, Debug, Clone)]
pub struct Device {
    pub id: String,
    pub connected: bool,
}
