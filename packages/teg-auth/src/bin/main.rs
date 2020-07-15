#[macro_use] extern crate log;

use async_graphql::*;
use async_graphql_warp::*;
use anyhow::{Result};

use warp::Filter;

use std::env;

use std::{time::Duration, sync::Arc};

extern crate teg_auth;
use teg_auth::{
    init,
    Context,
    Query,
    Mutation,
    watch_auth_pem_keys, backup::schedule_backups,
};
use futures::{try_join, FutureExt};

#[derive(thiserror::Error, Debug)]
pub enum ServiceError {
    #[error(transparent)]
    Other(#[from] anyhow::Error), // source and Display delegate to anyhow::Error
}
impl warp::reject::Reject for ServiceError {}
impl From<ServiceError> for warp::reject::Rejection {
    fn from(e: ServiceError) -> Self {
        warp::reject::custom(e)
    }
}

// impl From<anyhow::Error> for ServiceError {
//     fn from(e: anyhow::Error) -> Self {
//         ServiceError::Other(e)
//     }
// }

// impl From<url::ParseError> for ServiceError {
//     fn from(e: url::ParseError) -> Self {
//         ServiceError::Other(e.into())
//     }
// }

// #[async_std::main]
#[smol_potat::main]
async fn main() -> Result<()> {
    let Context {
        db,
        machine_config,
        ..
    } = init().await?;
    let auth_pem_keys = watch_auth_pem_keys().await?;

    let log = warp::log("warp");

    let port = env::var("PORT")
        .expect("$PORT must be set")
        .parse()
        .expect("Invalid $PORT");

    // let schema = Schema::new(Query, Mutation, EmptySubscription);
    let schema = Schema::new(Query, Mutation, EmptySubscription);

    let db_clone = Arc::clone(&db);
    let graphql_filter = async_graphql_warp::graphql(schema)
        .and(warp::header::optional::<String>("user-id"))
        .and(warp::header::optional::<String>("peer-identity-public-key"))  
        .and_then(move |
            (schema, builder): (_, QueryBuilder),
            user_id: Option<String>,
            identity_public_key: Option<String>,
        | {
            let user_id = user_id.map(|id| ID::from(id));

            let context = Context::new(
                Arc::clone(&db_clone),
                user_id,
                identity_public_key,
                Arc::clone(&auth_pem_keys),
                Arc::clone(&machine_config),
            );

            async move {
                let context = context
                    .await
                    .map_err(|err| {
                        error!("{}", err);
                        ServiceError::from(err)
                    })?;

                // Execute query
                let resp = builder
                    .data(context)
                    .execute(&schema)
                    .await;

                // println!("RESP: {:?}", resp);

                // Return result
                Ok::<_, warp::reject::Rejection>(GQLResponse::from(resp))
            }
        });

    eprintln!("Starting Auth Server");

    let server = warp::serve(
        graphql_filter
        // warp::get2()
        //     .and(warp::path("graphiql"))
        //     .and(juniper_warp::graphiql_filter("/graphql"))
        //     .or(homepage)
        //     .or(warp::path("graphql").and(graphql_filter))
            .with(log),
    )
        .run(([127, 0, 0, 1], port))
        .map(|_| Ok(()) as crate::Result<()>);

     let backup_scheduler = schedule_backups(
        &db,
        "/var/teg/backups",
        4,
        Duration::from_secs(10),
    );

    try_join!(server, backup_scheduler)?;

    Ok(())
}
