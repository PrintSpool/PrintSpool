// #[macro_use] extern crate async_std;
#[macro_use] extern crate diesel;
#[macro_use] extern crate juniper;
// #[macro_use] extern crate log;
// #[macro_use] extern crate graphql_client;
extern crate diesel_logger;
extern crate reqwest;
extern crate secp256k1;
extern crate rand;
// extern crate futures;
// extern crate futures03;
// extern crate serde;
// extern crate serde_json;
// extern crate url;

use warp::{http::Response, Filter};
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

use async_std::task;

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

    let database_url = env::var("POSTGRESQL_ADDON_URI")
        .expect("$POSTGRESQL_ADDON_URI must be set");
 
    let pool = sqlx::PgPool::new(&database_url)
        .await
        .map(|p| Arc::new(p))
        .expect("Could not connect to Postgres");

    let schema = Schema::new(Query, Mutation{});

    let state = warp::any()
        .and(warp::header::optional::<i32>("user-id"))
        .and_then(move |user_id| {
            task::block_on(
                Context::new(
                    Arc::clone(&pool),
                    user_id,
                )
            ).map_err(|err| {
                warp::reject::custom(err)
            })
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
