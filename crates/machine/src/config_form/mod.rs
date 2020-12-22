mod from_component;

use async_graphql::SimpleObject;

#[derive(SimpleObject)]
pub struct ConfigForm {
    pub id: async_graphql::ID,
    pub model: async_graphql::Json<serde_json::Value>,
    pub model_version: u32,
    pub schemaForm: JsonSchemaForm,
}

#[derive(SimpleObject)]
#[graphql(name=JSONSchemaForm)]
pub struct JsonSchemaForm {
    pub id: async_graphql::ID,
    pub schema: async_graphql::Json<serde_json::Value>,
    pub form: Vec<String>,
}

