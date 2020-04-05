// #[macro_use] extern crate async_std;
#[macro_use] extern crate juniper;
#[macro_use] extern crate log;

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

pub use context::Context;
pub use graphql_schema::{ Schema, Query, Mutation };

use async_std::task;

error_chain::error_chain! {}

#[async_std::main]
async fn main() -> Result<()> {
    dotenv().ok();
    env_logger::init();

    if std::env::args().any(|arg| arg == "migrate") {
        eprintln!("Running Auth Migrations [TODO: Not yet implemented!]");

        // use diesel::prelude::*;
        //
        // let database_url = env::var("POSTGRESQL_ADDON_URI")
        //     .expect("POSTGRESQL_ADDON_URI must be set");
        //
        // let connection = PgConnection::establish(&database_url)
        //     .expect(&format!("Error connecting to {}", database_url));
        //
        // // This will run the necessary migrations.
        // embedded_migrations::run(&connection)
        //     .chain_err(|| "Error running migrations")?;

        // By default the output is thrown out. If you want to redirect it to stdout, you
        // should call embedded_migrations::run_with_output.
        // embedded_migrations::run_with_output(&connection, &mut std::io::stdout())
        //     .chain_err(|| "Error running migrations")?;

        eprintln!("Running Auth Migrations: DONE");

        return Ok(())
    }

    eprintln!("Starting Auth Server");

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
    )
        .await
        .map_err(|err| {
            format!("{:?}", err)
        })?;

    let schema = Schema::new(Query, Mutation{});

    let pem_keys = Arc::new(models::jwt::get_pem_keys()?);
    task::spawn(async {
        info!("Firebase certs will refresh in an hour");
        task::sleep(std::time::Duration::from_secs(60 * 60)).await;

        info!("Restarting server to refresh Firebase certs");
        std::process::exit(0);
    });

    let state = warp::any()
        .and(warp::header::optional::<i32>("user-id"))
        .and_then(move |user_id| {
            task::block_on(
                Context::new(
                    Arc::clone(&pool),
                    user_id,
                    Arc::clone(&pem_keys),
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
