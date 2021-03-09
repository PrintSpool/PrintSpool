use async_graphql::SimpleObject;

#[derive(SimpleObject)]
pub struct ConfigForm {
    pub id: async_graphql::ID,
    pub model: async_graphql::Json<serde_json::Value>,
    pub model_version: i32,
    pub schema: async_graphql::Json<serde_json::Value>,
    pub form: Vec<String>,
    pub advanced_form: Vec<String>,
}

