use graphql_client::GraphQLQuery;

// The paths are relative to the directory where your `Cargo.toml` is located.
// Both json and the GraphQL schema language are supported as sources for the schema
#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "data/user_profile_schema.json",
    query_path = "src/user_profile_query.graphql",
    response_derives = "Debug",
)]
pub struct UserProfileQuery;

pub use user_profile_query::*;

#[juniper::object(
    description="A user"
)]
impl UserProfileQueryCurrentUser {
    fn id(&self) -> String {
        self.id.to_string()
    }
    fn name(&self) -> &Option<String> {
        &self.name
    }
    fn email(&self) -> &Option<String> {
        &self.email
    }
    fn email_verified(&self) -> bool {
        self.email_verified
    }
}
