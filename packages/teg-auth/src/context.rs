use super::PgPool;
use juniper::{FieldResult, FieldError};
use super::PgPooledConnection;
use diesel_logger::LoggingConnection;
use std::sync::Arc;

pub struct Context {
    pub pool: PgPool,
    pub sqlx_pool: Arc<sqlx::PgPool>,
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

    pub async fn sqlx_db(
        &self
    ) -> sqlx::Result<sqlx::pool::PoolConnection<sqlx::PgConnection>> {
        self.sqlx_pool.acquire().await
    }

    pub async fn tx(
        &self
    ) -> sqlx::Result<sqlx_core::Transaction<sqlx::pool::PoolConnection<sqlx::PgConnection>>> {
        self.sqlx_pool.begin().await
    }
}