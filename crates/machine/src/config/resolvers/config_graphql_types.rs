// use async_graphql::ID;

// /// Each config model encapsulates configuration of AUTH, PLUGIN, COMPONENT or MATERIAL.
// #[derive(async_graphql::Enum, Copy, Clone, Eq, PartialEq, Debug)]
// pub enum ConfigCollection {
//     AUTH,
//     COMPONENT,
//     MATERIAL,
//     PLUGIN,
// }

// #[derive(async_graphql::SimpleObject)]
// pub struct SetConfigResponse {
//     pub errors: Vec<JSONSchemaError>,
// }

// #[derive(async_graphql::SimpleObject)]
// pub struct JSONSchemaError {
//     /// The validation keyword.
//     pub keyword: String,
//     /// the path to the part of the data that was validated using
//     /// the RFC6901 JSON pointer standard (e.g., "/prop/1/subProp").
//     pub data_path: String,
//     /// the path (JSON-pointer as a URI fragment) to the schema of the keyword that
//     /// failed validation.
//     pub schema_path: String,

//     // TODO: Internationalization Support
//     // /// the object with the additional information about error that can be used to
//     // /// create custom error messages (e.g., using ajv-i18n package).
//     // params:  async_graphql::Json<serde_json::Value>,

//     /// the standard error message
//     pub message: String,
//   }

