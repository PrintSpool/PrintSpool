use warp::{http::Response, Filter};
use juniper::{ID};
use std::env;

use async_std::task;
use std::sync::Arc;

extern crate teg_auth;
use teg_auth::{
    init,
    Context,
    Schema,
    Query,
    Mutation,
    watch_auth_pem_keys,
};

#[async_std::main]
async fn main() -> teg_auth::Result<()> {
    let Context {
        db,
        machine_config,
        ..
    } = init().await?;
    let auth_pem_keys = watch_auth_pem_keys().await?;

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

    let schema = Schema::new(Query, Mutation{});

    // State
    let state = warp::any()
        .and(warp::header::optional::<String>("user-id"))
        .and(warp::header::optional::<String>("peer-identity-public-key"))  
        .and_then(move |user_id: Option<String>, identity_public_key| {
            let user_id = user_id.map(|id| ID::from(id));

            task::block_on(
                Context::new(
                    Arc::clone(&db),
                    user_id,
                    identity_public_key,
                    Arc::clone(&auth_pem_keys),
                    Arc::clone(&machine_config),
                )
            ).map_err(|err| {
                warp::reject::custom(format!("{:?}", err))
            })
        });

    let graphql_filter = juniper_warp::make_graphql_filter(schema, state.boxed());

    eprintln!("Starting Auth Server");

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
