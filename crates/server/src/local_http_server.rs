use async_graphql::http::{playground_source, GraphQLPlaygroundConfig};
use teg_auth::AuthContext;
use warp::{Filter, http::Response as HttpResponse, hyper::Method};
use eyre::{
    // eyre,
    Result,
    // Error,
    // Context as _,
};

#[derive(Debug)]
pub struct InternalServerError;
impl warp::reject::Reject for InternalServerError {}

pub async fn start(
    db: &crate::Db,
    schema_builder: crate::AppSchemaBuilder,
) -> Result<()> {
    if &std::env::var("INSECURE_LOCAL_CONNECTION").unwrap_or("0".to_string()) == "0" {
        debug!("Secure Connections Only: Insecure local connections are disabled.");
        futures_util::future::pending::<()>().await;
        return Ok(())
    }

    debug!("Insecure local connections are enabled");

    let port = std::env::var("LOCAL_HTTP_PORT")
        .unwrap_or("20807".to_string())
        .parse()
        .expect("Invalid $LOCAL_HTTP_PORT");

    info!("Playground: http://localhost:{}/playground", port);

    let auth = AuthContext::local_http_auth(db).await?;

    let schema = schema_builder
        .data(auth)
        .finish();

    let graphql_post = async_graphql_warp::graphql(schema.clone())
        .and(warp::body::content_length_limit(1024 * 1024 * 1024))
        .and_then(move |
            graphql_tuple,
        | {
            let (schema, request): (
                crate::AppSchema,
                async_graphql::Request,
            ) = graphql_tuple;

            async move {
                let root_span = span!(
                    parent: None,
                    tracing::Level::INFO,
                    "span root"
                );
                let request = request.data(
                    async_graphql::extensions::TracingConfig::default().parent_span(root_span),
                );

                Ok::<async_graphql_warp::Response, warp::Rejection>(
                    async_graphql_warp::Response::from(schema.execute(request).await)
                )
            }
        });

    let graphql_subscription =
        async_graphql_warp::graphql_subscription_with_data(schema, |_| async {
            let mut data = async_graphql::Data::default();

            let root_span = span!(
                parent: None,
                tracing::Level::INFO,
                "span root"
            );
            data.insert(
                async_graphql::extensions::TracingConfig::default().parent_span(root_span),
            );

            Ok(data)
        });

    let graphql_playground = warp::path("playground").and(warp::get()).map(|| {
        HttpResponse::builder()
            .header("content-type", "text/html")
            .body(playground_source(
                GraphQLPlaygroundConfig::new("/graphql")
                    .subscription_endpoint("/"),
            ))
    });

    let is_dev = std::env::var("RUST_ENV")
        .ok()
        .map(|rust_env| &rust_env == "development")
        .unwrap_or(true);

    if is_dev {
        let cors = warp::cors()
            .allow_any_origin()
            .allow_methods(&[Method::GET, Method::POST, Method::DELETE])
            .allow_headers(vec!["authorization", "content-type"]);

        let cors_route = warp::options()
            .map(warp::reply);

        let routes = graphql_playground
            .or(graphql_post)
            .or(graphql_subscription)
            .or(cors_route)
            .with(cors);

        warp::serve(routes).run(([0, 0, 0, 0], port)).await;
    } else {
        // Disable CORS in production to prevent unauthorized 3D printer access from random websites
        let routes = graphql_playground
            .or(graphql_post)
            .or(graphql_subscription);

        warp::serve(routes).run(([0, 0, 0, 0], port)).await;
    }

    Ok(())
}
