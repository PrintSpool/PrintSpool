#[macro_use] extern crate log;

use async_graphql::*;
use async_graphql_warp::*;
use anyhow::{Result};

use warp::Filter;

use std::env;

use std::{sync::Arc};
use chrono::Duration;

extern crate teg_auth;
use teg_auth::{
    init,
    Context,
    Query,
    Mutation,
    watch_auth_pem_keys, backup::schedule_backups,
};
use futures::FutureExt;

use teg_auth::machine::{
    socket::handle_machine_socket,
    models::Machine,
};
use teg_auth::print_queue::{
    tasks::PrintQueue,
    print_completion_loop::run_print_completion_loop,
};

use teg_auth::models::VersionedModel as _;

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
    let is_dev = std::env::var("RUST_ENV") == Ok("development".to_string());

    if is_dev {
        // \x07 causes the dev starter to emit a beep on start up
        println!("Staring Dev Server... \x07");
    }

    let Context {
        db,
        machine_config,
        ..
    } = init().await?;
    let (
        auth_pem_keys,
        pem_keys_refresh_task
    ) = watch_auth_pem_keys().await?;

    let log = warp::log("warp");

    let port = env::var("PORT")
        .expect("$PORT must be set")
        .parse()
        .expect("Invalid $PORT");

    // let schema = Schema::new(Query, Mutation, EmptySubscription);
    let schema = Schema::new(
        <Query>::default(),
        <Mutation>::default(),
        EmptySubscription
    );

    let db_clone = Arc::clone(&db);
    let machine_config_clone = machine_config.clone();

    let ctx = Context::new(
        Arc::clone(&db_clone),
        None,
        None,
        auth_pem_keys.clone(),
        machine_config_clone.clone(),
    ).await?;

    let ctx = Arc::new(ctx);

    // Database Initialization
    // -----------------------------------------------------------------
    let config = machine_config.load();

    if Machine::find_opt(&ctx.db, |m| m.config_id == config.id)?.is_none() {
        let machine = Machine::new(
            ctx.db.generate_id()?,
            config.id.clone(),
        );
        machine.insert(&ctx.db)?;
    };

    if PrintQueue::first_opt(&ctx.db)?.is_none() {
        let print_queue = PrintQueue::new(
            ctx.db.generate_id()?,
        );
        print_queue.insert(&ctx.db)?;
    };

    drop(config);

    // Print Completion Loop
    // -----------------------------------------------------------------
    let ctx_clone = Arc::clone(&ctx);
    let print_completion_loop = async_std::task::spawn(
        run_print_completion_loop(Arc::clone(&ctx_clone)),
    );

    // Machine Sockets
    // -----------------------------------------------------------------
    let ctx_clone = Arc::clone(&ctx);

    // TODO: handle socket errors task
    let _ = Machine::scan(&ctx.db)
        .map(move |machine| {
            let machine: Machine = machine?;
            async_std::task::spawn(
                handle_machine_socket(Arc::clone(&ctx_clone), machine.id),
            );
            Ok(())
        })
        .collect::<anyhow::Result<Vec<()>>>()?;

    // GraphQL Server
    // -----------------------------------------------------------------

    let graphql_filter = async_graphql_warp::graphql(schema)
        .and(warp::header::optional::<String>("user-id"))
        .and(warp::header::optional::<String>("peer-identity-public-key"))  
        .and_then(move |
            (schema, builder): (_, QueryBuilder),
            user_id: Option<String>,
            identity_public_key: Option<String>,
        | {
            info!("Req");
            let user_id = user_id.map(|id| ID::from(id));

            let ctx = Context::new(
                Arc::clone(&db_clone),
                user_id,
                identity_public_key,
                auth_pem_keys.clone(),
                machine_config_clone.clone(),
            );

            async move {
                let ctx = ctx
                    .await
                    .map(|ctx| Arc::new(ctx))
                    .map_err(|err| {
                        error!("{}", err);
                        ServiceError::from(err)
                    })?;

                // Execute query
                let res = builder
                    .data(ctx)
                    .execute(&schema)
                    .await;

                match res.as_ref() {
                    Ok(res) => info!("Res: {:?}", res.data),
                    Err(err) => warn!("Res: {:?}", err),
                };

                let res = GQLResponse::from(res);

                // Return result
                Ok::<_, warp::reject::Rejection>(res)
            }
        });

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

    // Backups
    // -----------------------------------------------------------------

    let backups_dir = machine_config
        .load()
        .backups_dir();

    let backup_scheduler = schedule_backups(
        &db,
        &&backups_dir,
        4,
        Duration::days(1),
    );

    info!("Starting Auth Server");

    let res = futures::select! {
        res = print_completion_loop.fuse() => res,
        res = server.fuse() => res,
        res = backup_scheduler.fuse() => res,
        res = pem_keys_refresh_task.fuse() => res,
    };

    res?;

    Ok(())
}
