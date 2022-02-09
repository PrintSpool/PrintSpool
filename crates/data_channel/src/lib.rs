#[macro_use] extern crate tracing;
#[macro_use] extern crate derive_new;

pub mod saltyrtc_chunk;
pub mod iter;
pub mod client_ws;

use eyre::{
    eyre,
    Context as _,
    Result,
};
use client_ws::connect_to_client_ws;
use serde::{Serialize, Deserialize};
// use printspool_machine::machine::messages::GetData;
use std::{
    pin::Pin,
    sync::Arc,
};
use async_tungstenite::{
    async_std::connect_async,
    tungstenite::Message,
    tungstenite::handshake::client::Request,
};
use std::sync::atomic::{ AtomicU64, Ordering };
use futures_util::{
    future::Future,
    // future::FutureExt,
    // future::try_join_all,
    SinkExt,
    stream::{
        Stream,
        StreamExt,
        // TryStreamExt,
    },
};
use printspool_auth::Signal;

pub use printspool_machine::paths;

pub type Db = sqlx::PgPool;

const PING_INTERVAL_MILLIS: u64 = 10_000;
// const PING_INTERVAL_MILLIS: u64 = 1_000;

static NEXT_MESSAGE_ID: AtomicU64 = AtomicU64::new(0);

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct SubscribeMessagePayload {
    operation_name: Option<String>,
    query: String,
    variables: Option<serde_json::Value>,
}

#[derive(Serialize, Deserialize, Debug)]
struct ExecutionResult {
    data: Option<serde_json::Value>,
    errors: Option<Vec<serde_json::Value>>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type", rename_all="snake_case")]
enum GraphQLWSMessage {
    ConnectionInit {
        payload: Option<serde_json::Value>,
    },
    ConnectionAck {
        payload: Option<serde_json::Value>,
    },
    ConnectionError {
        payload: Option<serde_json::Value>,
    },
    Subscribe {
        id: String,
        payload: SubscribeMessagePayload,
    },
    #[serde(alias = "data")]
    Next {
        id: String,
        payload: ExecutionResult,
    },
    Error {
        id: String,
        payload: Vec<serde_json::Value>,
    },
    Complete {
        id: String,
    },
}

pub async fn listen_for_signalling<F, Fut, S>(
    // db: crate::Db,
    server_keys: &Arc<printspool_auth::ServerKeys>,
    machines: &printspool_machine::MachineMap,
    handle_data_channel: F,
) -> Result<()>
where
    F: Fn(
        Signal,
        Pin<Box<dyn Stream<Item = saltyrtc_chunk::Message> + 'static + Send + Send>>,
    ) -> Fut + Send + Sync + 'static,
    Fut: Future<Output = Result<S>> + Send + 'static,
    S: Stream<Item = Vec<u8>> + Send + 'static,
{
    let handle_data_channel = Arc::new(handle_data_channel);

    loop {
        if let Err(err) = listen_for_signalling_no_reconnect(
            server_keys,
            machines,
            Arc::clone(&handle_data_channel),
        ).await {
            warn!("Disconnected from signalling server (will retry). Reason: {:?}", err);
        } else {
            warn!("Signalling server connection closed (will retry).");
        }
        // Prevent repeating signalling errors from going into a tight loop
        async_std::task::sleep(std::time::Duration::from_millis(100)).await;
    }
}

pub async fn listen_for_signalling_no_reconnect<F, Fut, S>(
    // db: crate::Db,
    server_keys: &Arc<printspool_auth::ServerKeys>,
    _machines: &printspool_machine::MachineMap,
    handle_data_channel: Arc<F>,
) -> Result<()>
where
    F: Fn(
        Signal,
        Pin<Box<dyn Stream<Item = saltyrtc_chunk::Message> + 'static + Send + Send>>,
    ) -> Fut + Send + Sync + 'static,
    Fut: Future<Output = Result<S>> + Send + 'static,
    S: Stream<Item = Vec<u8>> + Send + 'static,
{
    // let machines = machines.load();

    let signalling_server_ws = std::env::var("SIGNALLING_SERVER_WS")
        .wrap_err("SIGNALLING_SERVER_WS environment variable missing")?;
    let graphql_ws_url = format!("{}/graphql", signalling_server_ws);

    // Attempt to connect to the websocket every 500ms until successful
    let (
        mut ws_stream,
        _,
    ) = loop
    {
        let request = Request::builder()
            .uri(&graphql_ws_url)
            .body(())?;

        match connect_async(request).await {
            Ok(ws) => break ws,
            Err(err) => {
                warn!(
                    "Unable to connect to signalling server ({}) retrying in 500ms (reason: {:?})",
                    graphql_ws_url,
                    err,
                );
                async_std::task::sleep(std::time::Duration::from_millis(500)).await;
            },
        }
    };

    let jwt = server_keys.create_signalling_jwt(&graphql_ws_url)?;

    let msg = GraphQLWSMessage::ConnectionInit {
        // TODO: Send an authorization payload
        payload: Some(serde_json::json!({
            "identityPublicKey": server_keys.identity_public_key.clone(),
            "selfSignedJWT": jwt,
        })),
    };

    let msg = serde_json::to_string(&msg)?;
    ws_stream.send(Message::Text(msg)).await?;

    let msg = ws_stream
        .next()
        .await
        .ok_or_else(|| eyre!("didn't receive anything"))??
        .into_text()?;

    let msg: GraphQLWSMessage = serde_json::from_str(&msg)
        .wrap_err_with(|| format!("Error parsing GraphQL WS Message:\n{:?}", msg))?;
    if let GraphQLWSMessage::ConnectionAck {..} = msg {
    } else {
        Err(eyre!("Expected ConnectionAck, received: {:?}", msg))?;
    }

    // Subscribe to receive incoming connection requests
    // ------------------------------------------------------------
    let rx_signals_id = NEXT_MESSAGE_ID.fetch_add(1, Ordering::SeqCst).to_string();
    let msg = GraphQLWSMessage::Subscribe {
        id: rx_signals_id.clone(),
        payload: SubscribeMessagePayload {
            operation_name: Some("connectionRequested".to_string()),
            query: r#"
                subscription connectionRequested {
                    connectionRequested {
                        userID
                        email
                        emailVerified
                        invite
                        sessionID
                    }
                }
            "#.to_string(),
            variables: None,
        },
    };

    let msg = serde_json::to_string(&msg)?;
    ws_stream.send(Message::Text(msg)).await?;

    // Listen to the incoming stream of signals and open WebRTC data channels
    // ------------------------------------------------------------

    let (
        mut ws_write_unbuffered,
        mut ws_read,
    ) = ws_stream.split();

    // Buffer the ws_write through a channel so it can be shared across multiple tasks
    let (
        ws_write,
        mut ws_write_receiver,
    ) = async_std::channel::unbounded::<Message>();

    async_std::task::spawn(async move {
        while let Some(msg) = ws_write_receiver.next().await {
            let result = ws_write_unbuffered.send(msg).await;
            if let Err(err) = result {
                error!("Error sending to Signalling Websocket: {:?}", err);
            };
        }
    });

    info!("Listening for new connections from {}", graphql_ws_url);

    while let Some(msg) = async_std::future::timeout(
        std::time::Duration::from_millis(PING_INTERVAL_MILLIS),
        ws_read.next()
    )
        .await
        .transpose()
    {
        // Pings: If no data is sent within the timeout then send a PING to the server in order to
        // keep the connection open.
        let msg = match msg {
            Ok(msg) => msg?,
            Err(_) => {
                trace!("Pinging signalling server");
                ws_write.send(Message::Ping(vec![])).await?;
                continue;
            }
        };

        let msg = match msg {
            Message::Text(msg) => {
                msg
            }
            | Message::Ping(_)
            | Message::Pong(_)
            => {
                continue;
            }
            Message::Binary(_) => {
                return Err(eyre!("Received an unexpected binary message from {}", graphql_ws_url));
            }
            Message::Close(msg) => {
                warn!("Websocket closed by other side ({}), received: {:?}", graphql_ws_url, msg);
                return Ok(());
            }
        };

        let msg: GraphQLWSMessage = serde_json::from_str(&msg)
            .wrap_err_with(|| eyre!("Error parsing websocket message: {:?}", msg))?;

        match msg {
            GraphQLWSMessage::Next {
                payload: ExecutionResult { errors: Some(errors), .. },
                ..
            } => {
                return Err(eyre!("Signalling GraphQL Errors: {:?}", errors));
            }
            // Signal Received => Open a Data Channel
            GraphQLWSMessage::Next {
                id,
                payload: ExecutionResult { data: Some(mut data), .. },
            } if id == rx_signals_id => {
                let data = data["connectionRequested"].take();
                let signal: Signal = serde_json::from_value(data)?;

                connect_to_client_ws(
                    signal,
                    format!("{}/bridge/from-server", signalling_server_ws),
                    &graphql_ws_url,
                    server_keys,
                    Arc::clone(&handle_data_channel),
                ).await?;
            }
            // Ignore sucessful mutation responses
            | GraphQLWSMessage::Next {
                id,
                payload: ExecutionResult { data: Some(_), .. },
            }
            | GraphQLWSMessage::Complete { id}
            if id != rx_signals_id => {
                ()
            }
            msg => {
                return Err(eyre!("Unexpected Signalling Message: {:?}", msg));
            },
        }
    }
    Ok(())
}
