#[macro_use] extern crate async_std;
#[macro_use] extern crate diesel;
#[macro_use] extern crate juniper;
#[macro_use] extern crate log;
#[macro_use] extern crate graphql_client;
extern crate diesel_logger;
extern crate reqwest;
// extern crate futures;
// extern crate futures03;
// extern crate serde;
// extern crate serde_json;
// extern crate url;

use warp::{http::Response, Filter};
use diesel::pg::PgConnection;
use diesel::r2d2::{ Pool, PooledConnection, ConnectionManager };
use dotenv::dotenv;
use std::env;
use std::sync::Arc;

pub mod schema;
pub mod models;
mod context;
mod graphql_schema;
pub mod user_profile_query;

pub use context::Context;
pub use graphql_schema::{ Schema, Query, Mutation };

use diesel_logger::LoggingConnection;

pub type PgPool = Arc<Pool<ConnectionManager<PgConnection>>>;
pub type PgPooledConnection = LoggingConnection<PooledConnection<ConnectionManager<PgConnection>>>;

pub fn establish_db_connection() -> PgPool {
    let database_url = env::var("POSTGRESQL_ADDON_URI")
        .expect("$POSTGRESQL_ADDON_URI must be set");
    let manager = ConnectionManager::<PgConnection>::new(database_url.clone());

    let pool = Pool::builder()
        .max_size(2)
        .build(manager)
        .expect(&format!("Error connecting to {}", database_url));

    Arc::new(pool)
}


#[async_std::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();

    dotenv().ok();
    let log = warp::log("auth");

    let port = env::var("PORT")
        .expect("$PORT must be set")
        .parse()
        .expect("Invalid $PORT");

    let homepage = warp::path::end().map(|| {
        Response::builder()
            .header("content-type", "text/html")
            .body(format!(
                "<html><h1>juniper_warp</h1><div>visit <a href=\"/graphiql\">/graphiql</a></html>"
            ))
    });

    let pool = establish_db_connection();

    let database_url = env::var("POSTGRESQL_ADDON_URI")
        .expect("$POSTGRESQL_ADDON_URI must be set");
    let sqlx_pool = sqlx::PgPool::new(&database_url)
        .await
        .map(|p| Arc::new(p))
        .expect("Could not connect to Postgres");

    let schema = Schema::new(Query, Mutation{});

    let state = warp::any().map(move || {
        Context {
            sqlx_pool: Arc::clone(&sqlx_pool),
            pool: Arc::clone(&pool),
        }
    });
    let graphql_filter = juniper_warp::make_graphql_filter(schema, state.boxed());

    warp::serve(
        warp::get2()
            .and(warp::path("graphiql"))
            .and(juniper_warp::graphiql_filter("/graphql"))
            .or(homepage)
            .or(warp::path("graphql").and(graphql_filter))
            .with(log),
    )
    .run(([127, 0, 0, 1], port));

    Ok(())
}
