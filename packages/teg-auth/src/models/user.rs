use crate::schema::{users};

#[derive(Identifiable, Queryable, Debug, juniper::GraphQLObject)]
pub struct User {
    pub id: i32,
    pub user_profile_id: i32,
    pub name: Option<String>,
    pub email: Option<String>,
    pub email_verified: bool,
    pub phone_number: Option<String>,
    pub phone_number_verified: bool,
    pub is_admin: bool,
}

#[derive(AsChangeset)]
#[table_name="users"]
pub struct UpdateUser<'a> {
    pub id: &'a str,
    pub is_admin: bool,
}
