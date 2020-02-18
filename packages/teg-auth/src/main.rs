// #[macro_use] extern crate async_std;
#[macro_use] extern crate juniper;
// #[macro_use] extern crate log;
// #[macro_use] extern crate graphql_client;
// extern crate tokio;
extern crate reqwest;
extern crate secp256k1;
extern crate rand;
extern crate rmp_serde as rmps;
// extern crate futures;
// extern crate futures03;
extern crate serde;
// extern crate serde_json;
extern crate url;
extern crate gravatar;

use warp::{http::Response, Filter};
use dotenv::dotenv;
use std::env;
use std::sync::Arc;

pub mod models;
mod context;
mod graphql_schema;
pub mod user_profile_query;

pub use context::Context;
pub use graphql_schema::{ Schema, Query, Mutation };

use async_std::task;

error_chain::error_chain! {
    // // The type defined for this error. These are the conventional
    // // and recommended names, but they can be arbitrarily chosen.
    // //
    // // It is also possible to leave this section out entirely, or
    // // leave it empty, and these names will be used automatically.
    // types {
    //     Error, ErrorKind, ResultExt, Result;
    // }

    // // Without the `Result` wrapper:
    // //
    // // types {
    // //     Error, ErrorKind, ResultExt;
    // // }

    // // Automatic conversions between this error chain and other
    // // error chains. In this case, it will e.g. generate an
    // // `ErrorKind` variant called `Another` which in turn contains
    // // the `other_error::ErrorKind`, with conversions from
    // // `other_error::Error`.
    // //
    // // Optionally, some attributes can be added to a variant.
    // //
    // // This section can be empty.
    // links {
    //     Another(other_error::Error, other_error::ErrorKind) #[cfg(unix)];
    // }

    // // Automatic conversions between this error chain and other
    // // error types not defined by the `error_chain!`. These will be
    // // wrapped in a new error with, in the first case, the
    // // `ErrorKind::Fmt` variant. The description and cause will
    // // forward to the description and cause of the original error.
    // //
    // // Optionally, some attributes can be added to a variant.
    // //
    // // This section can be empty.
    // foreign_links {
    //     Fmt(::std::fmt::Error);
    //     Io(::std::io::Error) #[cfg(unix)];
    // }

    // // Define additional `ErrorKind` variants.  Define custom responses with the
    // // `description` and `display` calls.
    // errors {
    //     InvalidToolchainName(t: String) {
    //         description("invalid toolchain name")
    //         display("invalid toolchain name: '{}'", t)
    //     }

    //     // You can also add commas after description/display.
    //     // This may work better with some editor auto-indentation modes:
    //     UnknownToolchainVersion(v: String) {
    //         description("unknown toolchain version"), // note the ,
    //         display("unknown toolchain version: '{}'", v), // trailing comma is allowed
    //     }
    // }
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

    let database_url = env::var("POSTGRESQL_ADDON_URI")
        .expect("$POSTGRESQL_ADDON_URI must be set");

    let pool = sqlx::PgPool::new(&database_url)
        .await
        .map(|p| Arc::new(p))
        .expect("Could not connect to Postgres");

    models::Invite::generate_or_display_initial_invite(
        Arc::clone(&pool)
    ).await
    .map_err(|err| {
        std::io::Error::new(std::io::ErrorKind::Other, format!("{:?}", err))
    })?;

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
