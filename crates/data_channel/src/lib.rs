#[macro_use] extern crate tracing;
#[macro_use] extern crate derive_new;

pub mod saltyrtc_chunk;
pub mod iter;
pub mod open_data_channel;

use eyre::{
    eyre,
    Context as _,
    Result,
};
use open_data_channel::open_data_channel;
use serde::{Serialize, Deserialize};
use teg_machine::machine::messages::GetData;
use std::{
    pin::Pin,
    sync::Arc,
};
use chrono::{
    Duration,
    Utc
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
    future::try_join_all,
    SinkExt,
    stream::{
        Stream,
        StreamExt,
        // TryStreamExt,
    },
};
use dashmap::DashMap;
use teg_auth::Signal;

pub type Db = sqlx::sqlite::SqlitePool;

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
    server_keys: &Arc<teg_auth::ServerKeys>,
    machines: &teg_machine::MachineMap,
    handle_data_channel: F,
) -> Result<()>
where
    F: Fn(
        Signal,
        Pin<Box<dyn Stream<Item = Vec<u8>> + 'static + Send + Send>>,
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
            trace!("Disconnected from signalling server (will retry). Reason: {:?}", err);
            // Prevent repeating signalling errors from going into a tight loop
            async_std::task::sleep(std::time::Duration::from_millis(100)).await;
        }
    }
}

pub async fn listen_for_signalling_no_reconnect<F, Fut, S>(
    // db: crate::Db,
    server_keys: &Arc<teg_auth::ServerKeys>,
    machines: &teg_machine::MachineMap,
    handle_data_channel: Arc<F>,
) -> Result<()>
where
    F: Fn(
        Signal,
        Pin<Box<dyn Stream<Item = Vec<u8>> + 'static + Send + Send>>,
    ) -> Fut + Send + Sync + 'static,
    Fut: Future<Output = Result<S>> + Send + 'static,
    S: Stream<Item = Vec<u8>> + Send + 'static,
{
    let machines = machines.load();

    let signalling_url = std::env::var("SIGNALLING_SERVER")
        .wrap_err("SIGNALLING_SERVER environment variable missing")?;

    // Attempt to connect to the websocket every 500ms until successful
    let (
        mut ws_stream,
        _,
    ) = loop
    {
        let request = Request::builder()
            .uri(&signalling_url)
            .body(())?;

        match connect_async(request).await {
            Ok(ws) => break ws,
            Err(_) => {
                warn!("Unable to connect to signalling server, retrying in 500ms");
                async_std::task::sleep(std::time::Duration::from_millis(500)).await;
            },
        }
    };

    let jwt_headers = serde_json::json!({
    });

    let jwt_payload = serde_json::json!({
        "sub": "self",
        "aud": signalling_url.clone(),
        "exp": (Utc::now() + Duration::minutes(10)).timestamp(),
        "selfSignature": true,
    });

    let jwt = frank_jwt::encode(
        jwt_headers,
        &server_keys.identity_private_key,
        &jwt_payload,
        frank_jwt::Algorithm::ES256,
    )?;

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

    // Update the signalling servers list of machines
    // ------------------------------------------------------------
    let machines_json = machines
        .values()
        .map(|machine| async move {
            let data = machine.call(GetData).await??;
            Result::<serde_json::Value>::Ok(serde_json::json!({
                "slug": data.config.id,
                "name": data.config.name()?,
            }))
        });

    let machines_json = try_join_all(machines_json)
        .await?;

    let msg = GraphQLWSMessage::Subscribe {
        id: NEXT_MESSAGE_ID.fetch_add(1, Ordering::SeqCst).to_string(),
        payload: SubscribeMessagePayload {
            operation_name: Some("registerMachinesFromHost".to_string()),
            query: r#"
                mutation registerMachinesFromHost(
                    $input: RegisterMachinesInput!
                ) {
                    registerMachinesFromHost(input: $input) {
                        id
                    }
                }
            "#.to_string(),
            variables: Some(serde_json::json!({
                "input": {
                    "machines": machines_json,
                },
            })),
        },
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
    if let GraphQLWSMessage::Next {
        payload: ExecutionResult { data: Some(_), errors: None },
        ..
    } = msg {
    } else {
        Err(eyre!("Expected Next with data, received: {:?}", msg))?;
    }

    let msg = ws_stream
        .next()
        .await
        .ok_or_else(|| eyre!("didn't receive anything"))??
        .into_text()?;

    let msg: GraphQLWSMessage = serde_json::from_str(&msg)?;
    if let GraphQLWSMessage::Complete {..} = msg {
    } else {
        Err(eyre!("Expected Complete, received: {:?}", msg))?;
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
                        offer
                        iceServers {
                            url
                            urls
                            username
                            credential
                        }
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

    info!("Listening for WebRTC Connections from {}", signalling_url);

    let peer_connections = Arc::new(DashMap::new());

    while let Some(msg) = ws_read.next().await {
        let msg = msg?.into_text()?;
        let msg: GraphQLWSMessage = serde_json::from_str(&msg)?;

        match msg {
            GraphQLWSMessage::Next {
                payload: ExecutionResult { errors: Some(errors), .. },
                ..
            } => {
                Err(eyre!("Signalling GraphQL Errors: {:?}", errors))?;
            }
            // Signal Received => Open a Data Channel
            GraphQLWSMessage::Next {
                id,
                payload: ExecutionResult { data: Some(mut data), .. },
            } if id == rx_signals_id => {
                let data = data["connectionRequested"].take();
                let signal: Signal = serde_json::from_value(data)?;
                let handshake_session_id = signal.session_id.clone();

                let (
                    id,
                    pc,
                    answer,
                    mut ice_candidates_stream,
                ) = open_data_channel(
                    signal,
                    Arc::clone(&handle_data_channel),
                ).await?;
                // TODO: Remember to remove peer connections once they are closed!
                peer_connections.insert(id, pc);

                // Commented out: trickle ICE candidates were previously considered but have been
                // replaced by sending all ICE candidates at once for implementation simplicity.
                //
                // // Send up to 10 ice candidates at a time if they are available
                // let mut ice_candidates = ice_candidates
                //     .ready_chunks(10)
                //     .boxed();

                let mut ice_candidates = vec![];

                // Take all ice candidates up to and including the final empty string candidate
                while let Some(ic) = ice_candidates_stream.next().await {
                    let last_candidate = ic.candidate.is_empty();
                    trace!("Ice Candidate: {:?}", ic);
                    ice_candidates.push(ic);
                    if last_candidate {
                        break
                    };
                }

                // Send a mutation containing the answer and initial ice candidates back to the
                // signalling server
                let msg = GraphQLWSMessage::Subscribe {
                    id: NEXT_MESSAGE_ID.fetch_add(1, Ordering::SeqCst).to_string(),
                    payload: SubscribeMessagePayload {
                        operation_name: Some("respondToConnectionRequest".to_string()),
                        query: r#"
                            mutation respondToConnectionRequest(
                                $input: RespondToConnectionRequestInput!
                            ) {
                                respondToConnectionRequest(input: $input) {
                                    id
                                }
                            }
                        "#.to_string(),
                        variables: Some(serde_json::json!({
                            "input": {
                                "sessionID": handshake_session_id,
                                "answer": answer,
                                "iceCandidates": ice_candidates,
                            },
                        })),
                    },
                };

                let msg = serde_json::to_string(&msg)?;
                ws_write.send(Message::Text(msg)).await?;

                // Commented out: trickle ICE candidates were previously considered but have been
                // replaced by sending all ICE candidates at once for implementation simplicity.
                //
                // // Send the ice candidates back to the signalling server in a detached task
                // let ws_clone = ws_write.clone();
                // let send_ice_candidates = async move {
                //     while let Some(ic) = ice_candidates_stream.next().await {
                //         // Send the ice candidates back to the signalling server
                //         let msg = GraphQLWSMessage::Subscribe {
                //             id: NEXT_MESSAGE_ID.fetch_add(1, Ordering::SeqCst).to_string(),
                //             payload: SubscribeMessagePayload {
                //                 operation_name: Some("sendICECandidatesToClient".to_string()),
                //                 query: r#"
                //                     mutation sendICECandidatesToClient(
                //                         $input: SendICECandidatesInput!
                //                     ) {
                //                         sendICECandidatesToClient(input: $input)
                //                     }
                //                 "#.to_string(),
                //                 variables: Some(serde_json::json!({
                //                     "input": {
                //                         "sessionID": handshake_session_id,
                //                         "iceCandidates": ic,
                //                     },
                //                 })),
                //             },
                //         };

                //         let msg = serde_json::to_string(&msg)?;
                //         ws_clone.send(Message::Text(msg)).await?;
                //     }
                //     Result::<()>::Ok(())
                // };

                // async_std::task::spawn(async move {
                //     if let Err(err) = send_ice_candidates.await {
                //         error!("Error sending ICE Candidates: {:?}", err);
                //     };
                // });

                ()
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
            msg => Err(eyre!("Unexpected Signalling Message: {:?}", msg))?,
        }
    }
    Ok(())
}
