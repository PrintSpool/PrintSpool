// #![feature(backtrace)]
#[macro_use] extern crate log;

use async_graphql::*;
use async_graphql_warp::*;
use anyhow::{Result};
use async_std::task::spawn;
use async_std::future;

use warp::Filter;

use std::env;

use std::{sync::Arc};
use chrono::Duration;
use dotenv::dotenv;

use anyhow::{
    // anyhow,
    Context as _,
    // Result,
};

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
    models::{
        Machine,
        MachineStatus,
    },
};
use teg_auth::print_queue::{
    tasks::PrintQueue,
    print_completion_loop::run_print_completion_loop,
    part_deletion_watcher::run_part_deletion_watcher,
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

fn main() -> Result<()> {
    dotenv().ok();
    async_std::task::block_on(app())
}

async fn app() -> Result<()> {
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

    // Print completion and part deletes
    // -----------------------------------------------------------------
    let ctx_clone = Arc::clone(&ctx);
    let print_completion_loop = run_print_completion_loop(
        Arc::clone(&ctx_clone),
    );

    let part_deletion_watcher = run_part_deletion_watcher(
        Arc::clone(&ctx_clone),
    );

    // Machine Sockets
    // -----------------------------------------------------------------
    let ctx_clone = Arc::clone(&ctx);

    // reset each machine status
    let _ = Machine::scan(&ctx.db)
        .map(move |machine| {
            let mut machine: Machine = machine?;
            machine.status = MachineStatus::Disconnected;
            machine.insert(&Arc::clone(&ctx_clone.db))?;

            Ok(())
        })
        .collect::<Result<Vec<()>>>();

    let ctx_clone = Arc::clone(&ctx);

    // TODO: handle socket errors task
    let _ = Machine::scan(&ctx.db)
        .map(move |machine| {
            let machine: Machine = machine?;
            async_std::task::spawn(
                handle_machine_socket(
                    Arc::clone(&ctx_clone),
                    machine.id,
                ),
            );
            Ok(())
        })
        .collect::<anyhow::Result<Vec<()>>>()?;

    // GraphQL Server
    // -----------------------------------------------------------------

    let graphql_filter = async_graphql_warp::graphql(schema)
        .and(warp::header::optional::<String>("user-id"))
        .and(warp::header::optional::<String>("session-id"))
        .and(warp::header::optional::<String>("peer-identity-public-key"))
        .and_then(move |
            (schema, builder): (_, QueryBuilder),
            user_id: Option<String>,
            session_id: Option<String>,
            identity_public_key: Option<String>,
        | {
            if std::env::var("LOG_GRAPHQL_REQ") == Ok("1".into()) {
                info!("Req");
            }
            if std::env::var("TRACE_GRAPHQL_QUERY") == Ok("1".into()) {
                trace!("Query:\n{}", builder.query_source().trim());
            }

            let user_id = user_id.map(|id| ID::from(id));

            let ctx = Context::new(
                Arc::clone(&db_clone),
                user_id,
                identity_public_key,
                auth_pem_keys.clone(),
                machine_config_clone.clone(),
            );

            let req_handler = async move {
                let ctx = ctx
                    .await
                    .map(|mut ctx| {
                        ctx.session_id = session_id;
                        Arc::new(ctx)
                    })
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
                    Ok(res) => {
                        if std::env::var("LOG_GRAPHQL_RES") == Ok("1".into()) {
                            info!("Res: {:?}", res.data);
                        }
                    }
                    Err(err) => warn!("Res: {:?}", err),
                };

                let res = GQLResponse::from(res);

                // Return result
                Ok::<_, warp::reject::Rejection>(res)
            };

            let req_handler = future::timeout(
                // very long (1 hr 40 min) timeouts to allow for blocking sync gcodes
                std::time::Duration::from_secs(6_000),
                req_handler,
            );

            req_handler.then(|res| async {
                match res.with_context(|| "Request timeout") {
                    Ok(Ok(res)) => Ok(res),
                    Ok(Err(err)) => Err(err),
                    Err(err) => {
                        warn!("Request timeout");
                        // TODO: this causes a parser error in NodeJS because it is expecting
                        // json responses and gets plain text.
                        Err(ServiceError::from(err))?
                    },
                }
            })
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
        res = spawn(print_completion_loop).fuse() => res,
        res = spawn(part_deletion_watcher).fuse() => res,
        res = spawn(server).fuse() => res,
        res = backup_scheduler.fuse() => res,
        res = spawn(pem_keys_refresh_task).fuse() => res,
    };

    res?;

    Ok(())
}
