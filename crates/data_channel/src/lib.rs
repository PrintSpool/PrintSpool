#[macro_use] extern crate tracing;
#[macro_use] extern crate derive_new;

pub mod saltyrtc_chunk;
pub mod iter;
pub mod open_data_channel;

use eyre::{Context, Result, eyre};
use datachannel::SessionDescription;
use open_data_channel::open_data_channel;
use serde::{Serialize, Deserialize};
use teg_machine::machine::messages::GetData;
use std::{fs, pin::Pin};
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
    Subscribe {
        id: String,
        payload: SubscribeMessagePayload,
    },
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
    machines: &teg_machine::MachineMap,
    handle_data_channel: F,
) -> Result<()>
where
    F: Fn(Pin<Box<dyn Stream<Item = Vec<u8>> + 'static + Send + Sync>>) -> Fut + 'static,
    Fut: Future<Output = Result<S>> + 'static,
    S: Stream<Item = Vec<u8>> + Send + 'static,
{
    let identity_private_key = fs::read_to_string("/etc/teg/id_ecdsa")
        .wrap_err_with(|| format!("Missing identity private key"))?;
    let identity_public_key = fs::read_to_string("/etc/teg/id_ecdsa.pub")
        .wrap_err_with(|| format!("Missing identity public key"))?;
    let signalling_url = "https:://signalling.tegapp.com";

    let machines = machines.load();

    let jwt_headers = serde_json::json!({
        "sub": signalling_url,
        "exp": (Utc::now() + Duration::minutes(10)).timestamp(),
    });

    let jwt_payload = serde_json::json!({
        "identity_public_key": identity_public_key,
    });

    let jwt = frank_jwt::encode(
        jwt_headers,
        &identity_private_key,
        &jwt_payload,
        frank_jwt::Algorithm::ES256,
    )?;

    let signalling_server = std::env::var("SIGNALLING_SERVER")?;
    let request = Request::builder()
        .uri(signalling_server)
        .header("Authorization", jwt)
        .body(())?;

    let (mut ws_stream, _) = connect_async(request).await?;

    let msg = GraphQLWSMessage::ConnectionInit {
        payload: None
    };

    let msg = serde_json::to_string(&msg)?;
    println!("Sending: \"{}\"", msg);
    ws_stream.send(Message::Text(msg)).await?;

    let msg = ws_stream
        .next()
        .await
        .ok_or_else(|| eyre!("didn't receive anything"))??
        .into_text()?;

    let msg: GraphQLWSMessage = serde_json::from_str(&msg)?;
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
                "id": data.config.id,
                "name": data.config.name()?,
            }))
        });

    let machines_json = try_join_all(machines_json)
        .await?;

    let msg = GraphQLWSMessage::Subscribe {
        id: NEXT_MESSAGE_ID.fetch_add(1, Ordering::SeqCst).to_string(),
        payload: SubscribeMessagePayload {
            operation_name: Some("updateNetworkRegistration".to_string()),
            query: r#"
                mutation updateNetworkRegistration(
                    machines: RegisterMachinesInput!
                ) {
                    registerMachines(input: machines)
                }
            "#.to_string(),
            variables: Some(serde_json::json!({
                // TODO: list the machine IDs here
                "machines": machines_json,
            })),
        },
    };

    let msg = serde_json::to_string(&msg)?;
    println!("Sending: \"{}\"", msg);
    ws_stream.send(Message::Text(msg)).await?;

    let msg = ws_stream
        .next()
        .await
        .ok_or_else(|| eyre!("didn't receive anything"))??
        .into_text()?;

    let msg: GraphQLWSMessage = serde_json::from_str(&msg)?;
    if let GraphQLWSMessage::Next {..} = msg {
    } else {
        Err(eyre!("Expected Next, received: {:?}", msg))?;
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
            operation_name: Some("updateNetworkRegistration".to_string()),
            query: r#"
                subscribe receiveSignals {
                    receiveSignals {
                        offer
                    }
                }
            "#.to_string(),
            variables: None,
        },
    };

    #[derive(Serialize, Deserialize, Debug)]
    struct ReceiveSignalsResponse {
        #[serde(rename = "sessionID")]
        session_id: async_graphql::ID,
        offer: SessionDescription,
    }

    let msg = serde_json::to_string(&msg)?;
    println!("Sending: \"{}\"", msg);
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
                payload: ExecutionResult { data: Some(data), .. },
            } if id == rx_signals_id => {
                let ReceiveSignalsResponse {
                    session_id: handshake_session_id,
                    offer,
                } = serde_json::from_value(data)?;
                let (
                    answer,
                    ice_candidates,
                 ) = open_data_channel(offer, &handle_data_channel).await?;

                 // Send up to 10 ice candidates at a time if they are available
                 let mut ice_candidates = ice_candidates
                    .ready_chunks(10)
                    .boxed();

                // Send a mutation containing the answer and initial ice candidates back to the
                // signalling server
                let msg = GraphQLWSMessage::Subscribe {
                    id: NEXT_MESSAGE_ID.fetch_add(1, Ordering::SeqCst).to_string(),
                    payload: SubscribeMessagePayload {
                        operation_name: Some("answerSignal".to_string()),
                        query: r#"
                            mutation answerSignal(
                                input: AnswerSignalInput!
                            ) {
                                answerSignal(input: input)
                            }
                        "#.to_string(),
                        variables: Some(serde_json::json!({
                            "input": {
                                "sessionID": handshake_session_id.clone(),
                                "answer": answer,
                                "iceCandidates": ice_candidates.next().await
                            },
                        })),
                    },
                };

                let msg = serde_json::to_string(&msg)?;
                println!("Sending: \"{}\"", msg);
                ws_write.send(Message::Text(msg)).await?;

                // Send the ice candidates back to the signalling server in a detached task
                let ws_clone = ws_write.clone();
                let send_ice_candidates = async move {
                    while let Some(ic) = ice_candidates.next().await {
                        // Send the ice candidates back to the signalling server
                        let msg = GraphQLWSMessage::Subscribe {
                            id: NEXT_MESSAGE_ID.fetch_add(1, Ordering::SeqCst).to_string(),
                            payload: SubscribeMessagePayload {
                                operation_name: Some("sendIceCandidates".to_string()),
                                query: r#"
                                    mutation sendIceCandidates(
                                        input: SendIceCandidatesInput!
                                    ) {
                                        sendIceCandidates(input: input)
                                    }
                                "#.to_string(),
                                variables: Some(serde_json::json!({
                                    "input": {
                                        "sessionID": handshake_session_id,
                                        "iceCandidates": ic,
                                    },
                                })),
                            },
                        };

                        let msg = serde_json::to_string(&msg)?;
                        println!("Sending: \"{}\"", msg);
                        ws_clone.send(Message::Text(msg)).await?;
                    }
                    Result::<()>::Ok(())
                };

                async_std::task::spawn(async move {
                    if let Err(err) = send_ice_candidates.await {
                        error!("Error sending ICE Candidates: {:?}", err);
                    };
                });

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
