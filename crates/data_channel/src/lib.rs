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
use std::sync::atomic::{ AtomicU64, Ordering };
use futures_util::{
    future::Future,
    future::FutureExt,
    future::try_join_all,
    SinkExt,
    stream::{
        Stream,
        StreamExt,
        TryStreamExt,
    },
};

pub type Db = sqlx::sqlite::SqlitePool;

static NEXT_MESSAGE_ID: AtomicU64 = AtomicU64::new(0);

#[derive(Clone)]
struct OutgoingChannel {
    output: channel::Sender<Vec<u8>>,
}

#[derive(Clone)]
enum Channel {
    Outgoing(OutgoingChannel),
    Incoming,
}

impl DataChannel for Channel {
    // fn on_open(&mut self) {
    //     if let Channel::Outgoing(channel) = self {
    //         let ready = channel.ready.clone();
    //         spawn_blocking(|| async {
    //             ready.send(()).await
    //         });
    //     }
    // }

    fn on_message(&mut self, msg: &[u8]) {
        if let Channel::Outgoing(channel) = self {
            // let msg = String::from_utf8_lossy(msg).to_string();
            let msg = msg.to_vec();
            let output = channel.output.clone();
            spawn_blocking(|| async {
                output.send(msg)
                    .await
                    .expect("Unable to receive DataChannel message");
            });
        }
    }
}

struct Conn {
    dc: Option<Box<RtcDataChannel<Channel>>>,
    sdp_answer_sender: channel::Sender<SessionDescription>,
    ice_candidate_sender: channel::Sender<IceCandidate>,
}

impl PeerConnection for Conn {
    type DC = Channel;

    fn on_description(&mut self, sess_desc: SessionDescription) {
        // TODO: Send a response via the websocket including our sess_desc answer
        // mutation(input: AnswerConnectionRequestInput) {
        //     answerConnectionRequest(input: $input)
        // }
        let sdp_answer_sender = self.sdp_answer_sender.clone();
        spawn_blocking(|| async {
            sdp_answer_sender
                .send(sess_desc)
                .await
                .expect("Unable to send SDP Answer")
        });
    }

    fn on_candidate(&mut self, cand: IceCandidate) {
        // log::info!("Candidate {}: {} {}", self.id, &cand.candidate, &cand.mid);
        // self.signalling.send(PeerMsg::RemoteCandidate { cand }).ok();
        let ice_candidate_sender = self.ice_candidate_sender.clone();
        spawn_blocking(|| async {
            ice_candidate_sender
                .send(cand)
                .await
                .expect("Unable to send SDP Answer")
        });
    }

    fn on_connection_state_change(&mut self, state: ConnectionState) {
        // log::info!("State {}: {:?}", self.id, state);
    }

    fn on_gathering_state_change(&mut self, state: GatheringState) {
        // log::info!("Gathering state {}: {:?}", self.id, state);
    }

    fn on_data_channel(&mut self, mut dc: Box<RtcDataChannel<Channel>>) {
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

pub async fn open_data_channel<F, Fut, S>(
    remote_description: SessionDescription,
    mut handle_data_channel: F,
) -> Result<(
    SessionDescription,
    impl Stream<Item = IceCandidate>,
    impl Future<Output = Result<()>>,
)>
where
    F: FnMut(Box<dyn Stream<Item = Result<Vec<u8>>>>) -> Fut,
    Fut: Future<Output = Result<S>>,
    S: Stream<Item = Vec<u8>> + Sync + Send + 'static,
{
    use saltyrtc_chunk::{
        ReliabilityMode,
        ChunkDecoder,
        ChunkEncoder,
    };

    let mode = ReliabilityMode::ReliableOrdered;

    let ice_servers = vec!["stun:stun.l.google.com:19302".to_string()];
    let conf = Config::new(ice_servers);

    let (
        sdp_answer_sender,
        mut sdp_answer_receiver,
    ) = unbounded::<SessionDescription>();

    let (
        ice_candidate_sender,
        mut ice_candidate_receiver,
    ) = unbounded::<IceCandidate>();

    let (
        dc_output_sender,
        dc_output_receiver,
    ) = unbounded::<Vec<u8>>();

    let dc_output_receiver = ChunkDecoder::new(mode)
        .decode_stream(dc_output_receiver);

    let conn = Conn {
        dc: None,
        sdp_answer_sender,
        ice_candidate_sender,
    };

    let channel = Channel::Outgoing(OutgoingChannel {
        output: dc_output_sender,
    });

    let mut pc = RtcPeerConnection::new(
        &conf,
        conn,
        Channel::Incoming,
    )?;

    let mut dc = pc.create_data_channel("graphql", channel)?;

    pc.set_remote_description(&remote_description)?;

    let dc_input_msgs = handle_data_channel(
        Box::new(dc_output_receiver)
    )
        .await?;

    let mut dc_input_chunks = ChunkEncoder::new(mode)
        .encode_stream(dc_input_msgs)
        .boxed();

    let datachannel_completion = async move {
        while let Some(msg) = dc_input_chunks.next().await {
            dc.send(&msg)?;
        }
        Result::<()>::Ok(())
    };
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

    let sdp_answer = sdp_answer_receiver.next()
        .await
        .ok_or_else(|| anyhow!("SDP answer not received"))?;

    Ok((
        sdp_answer,
        ice_candidate_receiver,
        datachannel_completion,
    ))
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

pub async fn listen_for_signalling<F, Fut, S>(
    db: crate::Db,
    machines: teg_machine::MachineMap,
    mut handle_data_channel: F,
) -> Result<()>
where
    F: FnMut(Box<dyn Stream<Item = Result<Vec<u8>>>>) -> Fut,
    Fut: Future<Output = Result<S>>,
    S: Stream<Item = Vec<u8>> + Sync + Send + 'static,
{
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
                let (
                    answer,
                    ice_candidates,
                    data_channel_completion,
                 ) = open_data_channel(offer, handle_data_channel).await?;

                 // Send up to 10 ice candidates at a time if they are available
                 let ice_candidates = ice_candidates
                    .ready_chunks(10)
                    .boxed();

                // Send a mutation containing the answer and initial ice candidates back to the
                // signalling server
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
                                "iceCandidates": ice_candidates.next().await
                            },
                        })),
                    },
                };

                let msg = serde_json::to_string(&msg)?;
                println!("Sending: \"{}\"", msg);
                ws_stream.send(Message::Text(msg)).await?;

                // TODO: interlace streaming ice candidates and data channel completion with other operations
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
