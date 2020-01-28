use crate::schema::{users};

#[derive(Identifiable, Queryable, Debug, juniper::GraphQLObject)]
pub struct User {
    pub id: i32,
    pub user_profile_id: String,
    pub name: Option<String>,
    pub email: Option<String>,
    pub email_verified: bool,
    pub is_admin: bool,
    pub is_authorized: bool,
}

// #[derive(Insertable, Debug)]
// #[table_name="users"]
// pub struct NewUser {
//     pub user_profile_id: String,
//     pub name: Option<String>,
//     pub email: Option<String>,
//     pub email_verified: bool,
// }

#[derive(AsChangeset, juniper::GraphQLInputObject)]
#[table_name="users"]
pub struct UpdateUser {
    pub id: String,
    pub is_admin: bool,
}
