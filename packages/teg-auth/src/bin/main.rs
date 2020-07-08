#[macro_use] extern crate log;

use warp::{http::Response, Filter};
use async_graphql::*;
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

    let schema = Schema::new(QueryRoot, Mutation{}, EmptySubscription);
    let graphql_filter = async_graphql_warp::graphql(schema)
        .and(warp::header::optional::<String>("user-id"))
        .and(warp::header::optional::<String>("peer-identity-public-key"))  
        .and_then(|
            (schema, builder): (_, QueryBuilder),
            user_id: Option<String>,
            identity_public_key: Option<String>,
        | async move {
            let ctx = Context::new(
                Arc::clone(&db),
                user_id,
                identity_public_key,
                Arc::clone(&auth_pem_keys),
                Arc::clone(&machine_config),
            )
                .await
                .map_err(|err| {
                    use error_chain::ChainedError;

                    error!("{}", err.display_chain().to_string());
                    warp::reject::custom(err.to_string())
                })?;

            // Execute query
            let resp = builder
                .data(ctx)
                .execute(&schema)
                .await;

            // Return result
            Ok::<_, Infallible>(warp::reply::json(&GQLResponse(resp)).into_response())
        });

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
                use error_chain::ChainedError;

                error!("{}", err.display_chain().to_string());
                warp::reject::custom(err.to_string())
            })
        });

    eprintln!("Starting Auth Server");

    warp::serve(
        graphql_filter
        // warp::get2()
        //     .and(warp::path("graphiql"))
        //     .and(juniper_warp::graphiql_filter("/graphql"))
        //     .or(homepage)
        //     .or(warp::path("graphql").and(graphql_filter))
        //     .with(log),
    )
        .run(([127, 0, 0, 1], port));

    Ok(())
}
