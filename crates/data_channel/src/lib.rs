#[macro_use] extern crate tracing;
#[macro_use] extern crate derive_new;

pub mod saltyrtc_chunk;
pub mod iter;

use anyhow::{
    anyhow,
    Result,
    // Context as _,
};
use async_std::{channel::{self, TryRecvError, unbounded}, task::spawn_blocking};
use serde::{Serialize, Deserialize};
use teg_machine::machine::messages::GetData;
use std::fs;
use chrono::{DateTime, Duration, Utc};
use datachannel::{Config, ConnectionState, DataChannel, GatheringState, IceCandidate, PeerConnection, RtcDataChannel, RtcPeerConnection, SessionDescription};
use async_tungstenite::{
    async_std::connect_async,
    tungstenite::Message,
    tungstenite::handshake::client::Request,
};
use futures_util::{SinkExt, StreamExt, future::{join_all, try_join_all}};
use std::sync::atomic::{ AtomicU64, Ordering };

pub type Db = sqlx::sqlite::SqlitePool;

static NEXT_MESSAGE_ID: AtomicU64 = AtomicU64::new(0);

#[derive(Clone)]
struct Chan {
    output: channel::Sender<Vec<u8>>,
    ready: channel::Sender<()>,
}

impl DataChannel for Chan {
    fn on_open(&mut self) {
        let ready = self.ready.clone();
        spawn_blocking(|| async {
            ready.send(()).await
        });
    }

    fn on_message(&mut self, msg: &[u8]) {
        // let msg = String::from_utf8_lossy(msg).to_string();
        let msg = msg.to_vec();
        let output = self.output.clone();
        spawn_blocking(|| async {
            output.send(msg).await;
        });
    }
}

struct Conn {
    signalling: channel::Sender<Message>,
    dc: Option<Box<RtcDataChannel<Chan>>>,
}

impl PeerConnection for Conn {
    type DC = Chan;

    fn on_description(&mut self, sess_desc: SessionDescription) {
        // TODO: Send a response via the websocket including our sess_desc answer
        // mutation(input: AnswerConnectionRequestInput) {
        //     answerConnectionRequest(input: $input)
        // }

        // let peer_msg = PeerMsg {
        //     dest_id: self.dest_id,
        //     kind: MsgKind::Description(sess_desc),
        // };

        // self.signalling
        //     .try_send(Message::binary(serde_json::to_vec(&peer_msg).unwrap()))
        //     .ok();
    }

    fn on_candidate(&mut self, cand: IceCandidate) {
        // log::info!("Candidate {}: {} {}", self.id, &cand.candidate, &cand.mid);
        // self.signalling.send(PeerMsg::RemoteCandidate { cand }).ok();
    }

    fn on_connection_state_change(&mut self, state: ConnectionState) {
        // log::info!("State {}: {:?}", self.id, state);
    }

    fn on_gathering_state_change(&mut self, state: GatheringState) {
        // log::info!("Gathering state {}: {:?}", self.id, state);
    }

    fn on_data_channel(&mut self, mut dc: Box<RtcDataChannel<Chan>>) {
        info!(
            "Received Datachannel with: label={}, protocol={:?}, reliability={:?}",
            dc.label(),
            dc.protocol(),
            dc.reliability()
        );

        // dc.send(format!("Hello from {}", self.peer_id).as_bytes())
        //     .ok();
        self.dc.replace(dc);
    }
}

pub async fn open_data_channel(
    remote_description: SessionDescription,
    signalling: channel::Sender<Message>,
) -> Result<()> {
    let ice_servers = vec!["stun:stun.l.google.com:19302".to_string()];
    let conf = Config::new(ice_servers);

    let (input_sender, input_receiver) = unbounded::<Vec<u8>>();
    let (output_sender, output_receiver) = unbounded::<Vec<u8>>();
    let (ready_sender, mut ready_receiver) = unbounded::<()>();

    let input_receiver = input_receiver
        .flat_map(|msg|: {

        })

    let conn = Conn {
        dc: None,
        signalling,
    };
    let chan = Chan {
        output: output_sender,
        ready: ready_sender,
    };

    let mut pc = RtcPeerConnection::new(
        &conf,
        conn,
        chan,
    )?;

    // let mut dc = pc.create_data_channel("graphql", chan)?;
    // dc.send("Hello Peer!".as_bytes())?;

    pc.set_remote_description(&remote_description)?;

    // TODO: connection timeout?
    ready_receiver.next().await;

    // let _ = async_graphql::http::WebSocket::with_data(
    //     schema,
    //     ws_receiver
    //         .take_while(|msg| future::ready(msg.is_ok()))
    //         .map(Result::unwrap)
    //         .map(ws::Message::into_bytes),
    //     initializer,
    //     protocol,
    // )
    //     .map(ws::Message::text)
    //     .map(Ok)
    //     .forward(ws_sender)
    //     .await;

    Ok(())
}

#[derive(Serialize, Deserialize, Debug)]
struct SubscribeMessagePayload {
    operationName: Option<String>,
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

pub async fn listen_for_signalling(
    db: crate::Db,
    machines: teg_machine::MachineMap,
    // query_graphql: async Fn(),
) -> Result<()> {
    let identity_private_key = fs::read_to_string("/etc/teg/id_ecdsa")?;
    let identity_public_key = fs::read_to_string("/etc/teg/id_ecdsa.pub")?;
    let signalling_url = "https:://signalling.tegapp.com";

    let machines: &teg_machine::MachineMap = ctx.data()?;
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

    let request = Request::builder()
        .uri("wss://echo.websocket.org")
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
        .ok_or_else(|| anyhow!("didn't receive anything"))??
        .into_text()?;

    let msg: GraphQLWSMessage = serde_json::from_str(&msg)?;
    if let GraphQLWSMessage::ConnectionAck {..} = msg {
    } else {
        Err(anyhow!("Expected ConnectionAck, received: {:?}", msg))?;
    }

    // Update the signalling servers list of machines
    // ------------------------------------------------------------
    let machinesJSON = machines
        .values()
        .map(|machine| async {
            let data = machine.call(GetData).await??;
            Ok(serde_json::json!({
                "id": data.config.id,
                "name": data.config.name()?,
            }))
        });

    let machinesJSON = try_join_all(machinesJSON)
        .await?;

    let msg = GraphQLWSMessage::Subscribe {
        id: NEXT_MESSAGE_ID.fetch_add(1, Ordering::SeqCst).to_string(),
        payload: SubscribeMessagePayload {
            operationName: Some("updateNetworkRegistration".to_string()),
            query: r#"
                mutation updateNetworkRegistration(
                    machines: RegisterMachinesInput!
                ) {
                    registerMachines(input: machines)
                }
            "#.to_string(),
            variables: Some(serde_json::json!({
                // TODO: list the machine IDs here
                "machines": machinesJSON,
            })),
        },
    };

    let msg = serde_json::to_string(&msg)?;
    println!("Sending: \"{}\"", msg);
    ws_stream.send(Message::Text(msg)).await?;

    let msg = ws_stream
        .next()
        .await
        .ok_or_else(|| anyhow!("didn't receive anything"))??
        .into_text()?;

    let msg: GraphQLWSMessage = serde_json::from_str(&msg)?;
    if let GraphQLWSMessage::Next {..} = msg {
    } else {
        Err(anyhow!("Expected Next, received: {:?}", msg))?;
    }

    let msg = ws_stream
        .next()
        .await
        .ok_or_else(|| anyhow!("didn't receive anything"))??
        .into_text()?;

    let msg: GraphQLWSMessage = serde_json::from_str(&msg)?;
    if let GraphQLWSMessage::Complete {..} = msg {
    } else {
        Err(anyhow!("Expected Complete, received: {:?}", msg))?;
    }

    // Subscribe to receive incoming connection requests
    // ------------------------------------------------------------
    let rx_signals_id = NEXT_MESSAGE_ID.fetch_add(1, Ordering::SeqCst).to_string();
    let msg = GraphQLWSMessage::Subscribe {
        id: rx_signals_id,
        payload: SubscribeMessagePayload {
            operationName: Some("updateNetworkRegistration".to_string()),
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
        offer: SessionDescription,
    }

    let msg = serde_json::to_string(&msg)?;
    println!("Sending: \"{}\"", msg);
    ws_stream.send(Message::Text(msg)).await?;

    // Listen to the incoming stream of signals and open WebRTC data channels
    // ------------------------------------------------------------

    let (
        ws_write,
        ws_read,
    ) = ws_stream.split();

    while let Some(msg) = ws_read.next().await {
        let msg = msg?.into_text()?;
        let msg: GraphQLWSMessage = serde_json::from_str(&msg)?;

        match msg {
            GraphQLWSMessage::Next {
                payload: ExecutionResult { errors: Some(errors), .. },
                ..
            } => {
                Err(anyhow!("Signalling GraphQL Errors: {:?}", errors))?;
            }
            // Signal Received
            GraphQLWSMessage::Next {
                id: rx_signals_id,
                payload: ExecutionResult { data: Some(data), .. },
            } => {
                let ReceiveSignalsResponse {
                    offer
                } = serde_json::from_value(data)?;
                let answer = open_data_channel(offer).await?;
                // TODO: send a mutation containing the answer back to the signalling server
                let msg = GraphQLWSMessage::Subscribe {
                    id: NEXT_MESSAGE_ID.fetch_add(1, Ordering::SeqCst).to_string(),
                    payload: SubscribeMessagePayload {
                        operationName: Some("answerSignal".to_string()),
                        query: r#"
                            mutation answerSignal(
                                input: AnswerSignalInput!
                            ) {
                                answerSignal(input: input)
                            }
                        "#.to_string(),
                        variables: Some(serde_json::json!({
                            "input": {
                                "answer": answer,
                            },
                        })),
                    },
                };

                let msg = serde_json::to_string(&msg)?;
                println!("Sending: \"{}\"", msg);
                ws_stream.send(Message::Text(msg)).await?;

                ()
            }
            // Ignoring sucessful mutation responses
            | GraphQLWSMessage::Next {
                id,
                payload: ExecutionResult { data: Some(_), .. },
            }
            | GraphQLWSMessage::Complete { id}
            if id != rx_signals_id => {
                ()
            }
            msg => Err(anyhow!("Unexpected Signalling Message: {:?}", msg))?,
        }
    }
    Ok(())
}
