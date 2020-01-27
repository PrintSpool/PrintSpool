use super::PgPool;
use juniper::{FieldResult, FieldError};
use super::PgPooledConnection;
use diesel_logger::LoggingConnection;

pub struct Context {
    pub pool: PgPool,
    // pub user_id: i32,
}

// To make our context usable by Juniper, we have to implement a marker trait.
impl juniper::Context for Context {}

impl Context {
    pub fn db(&self) -> FieldResult<PgPooledConnection> {
        self.pool
            .get()
            .map(|conn| LoggingConnection::new(conn))
            .map_err(|e| {
                FieldError::new(
                    format!("Could not open connection to the database {}", e.to_string()),
                    graphql_value!({ "internal_error": "Connection refused" })
                )
            })
    }
}