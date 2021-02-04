use std::{pin::Pin, sync::atomic::{ AtomicU64, Ordering }};
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use async_std::task::block_on;
use datachannel::{
    RtcConfig,
    ConnectionState,
    DataChannelHandler,
    GatheringState,
    IceCandidate,
    PeerConnectionHandler,
    RtcDataChannel,
    RtcPeerConnection,
    SessionDescription
};
use futures_util::{
    future,
    future::Future,
    stream::{
        Stream,
        StreamExt,
        TryStreamExt,
    },
};
use teg_auth::Signal;

static NEXT_ID: AtomicU64 = AtomicU64::new(0);

#[derive(Clone)]
pub struct OutgoingChannel {
    output: async_std::channel::Sender<Vec<u8>>,
}

#[derive(Clone)]
pub enum Channel {
    Outgoing(OutgoingChannel),
    Incoming,
}

impl DataChannelHandler for Channel {
    // fn on_open(&mut self) {
    //     if let Channel::Outgoing(channel) = self {
    //         let ready = channel.ready.clone();
    //         block_on(|| async {
    //             ready.send(()).await
    //         });
    //     }
    // }

    fn on_message(&mut self, msg: &[u8]) {
        if let Channel::Outgoing(channel) = self {
            let msg = msg.to_vec();
            let output = channel.output.clone();
            block_on(async move {
                output.send(msg)
                    .await
                    .expect("Unable to receive DataChannel message");
            });
        }
    }
}

pub struct Conn {
    id: u64,
    dc: Option<Box<RtcDataChannel<Channel>>>,
    sdp_answer_sender: async_std::channel::Sender<SessionDescription>,
    ice_candidate_sender: Option<async_std::channel::Sender<IceCandidate>>,
}

impl PeerConnectionHandler for Conn {
    type DC = Channel;

    fn on_description(&mut self, sess_desc: SessionDescription) {
        // TODO: Send a response via the websocket including our sess_desc answer
        // mutation(input: AnswerConnectionRequestInput) {
        //     answerConnectionRequest(input: $input)
        // }
        let sdp_answer_sender = self.sdp_answer_sender.clone();
        block_on(async move {
            sdp_answer_sender
                .send(sess_desc)
                .await
                .expect("Unable to send SDP Answer")
        });
    }

    fn on_candidate(&mut self, cand: IceCandidate) {
        info!("Candidate {}: {} {}", self.id, &cand.candidate, &cand.mid);

        let ice_candidate_sender = if let
            Some(sender) = &self.ice_candidate_sender
        {
            sender.clone()
        } else {
            warn!("Ice Candidate received after gathering ended: {:?}", cand);
            return
        };

        block_on(async move {
            ice_candidate_sender
                .send(cand)
                .await
                .expect("Unable to send SDP Answer")
        });
    }

    fn on_connection_state_change(&mut self, state: ConnectionState) {
        info!("State {}: {:?}", self.id, state);
    }

    fn on_gathering_state_change(&mut self, state: GatheringState) {
        info!("Gathering state {}: {:?}", self.id, state);
        if let GatheringState::Complete = state {
            // drop the ice candidate sender once the ice candidates have been gathered
            self.ice_candidate_sender = None;
        }
    }

    fn on_data_channel(&mut self, dc: Box<RtcDataChannel<Channel>>) {
        info!(
            "Channel {} Received Datachannel with: label={}, protocol={:?}, reliability={:?}",
            self.id,
            dc.label(),
            dc.protocol(),
            dc.reliability()
        );

        self.dc.replace(dc);
    }

    fn data_channel_handler(&mut self) -> Self::DC {
        Channel::Incoming
    }
}

pub async fn open_data_channel<F, Fut, S>(
    signal: Signal,
    // remote_description: SessionDescription,
    // signalling_user_id: String,
    handle_data_channel: &F,
) -> Result<(
    u64,
    Box<RtcPeerConnection<Conn>>,
    SessionDescription,
    impl Stream<Item = IceCandidate>,
)>
where
    F: Fn(
        Signal,
        Pin<Box<dyn Stream<Item = Vec<u8>> + 'static + Send + Sync>>,
    ) -> Fut + 'static,
    Fut: Future<Output = Result<S>> + 'static,
    S: Stream<Item = Vec<u8>> + Send + 'static,
{
    use crate::saltyrtc_chunk::{
        ReliabilityMode,
        ChunkDecoder,
        ChunkEncoder,
    };

    let id = NEXT_ID.fetch_add(1, Ordering::SeqCst);
    let mode = ReliabilityMode::ReliableOrdered;

    let ice_servers: Vec<String> = signal.ice_servers
        .iter()
        .map(|ice_server| {
            ice_server.urls.iter().map(move |url| {
                let url = match (&ice_server.username, &ice_server.credential) {
                    (Some(username), Some(credential)) => {
                       url.replacen(":", &format!(":{}:{}@", username, credential), 1)
                    },
                    (Some(username), None) => {
                        url.replacen(":", &format!(":{}@", username), 1)
                     },
                     (None, None) => {
                        url.clone()
                     },
                     _ => Err(eyre!("credential received without username"))?,
                 };
                 Ok(url)
            })
        })
        .flatten()
        .collect::<Result<_>>()?;

    // let ice_servers = vec![
    //     "stun:stun.l.google.com:19302".to_string(),
    //     "stun:global.stun.twilio.com:3478?transport=udp".to_string(),
    // ];
    debug!("ice servers: {:?}", ice_servers);

    let conf = RtcConfig::new(&ice_servers[..]);

    let (
        sdp_answer_sender,
        mut sdp_answer_receiver,
    ) = async_std::channel::unbounded::<SessionDescription>();

    let (
        ice_candidate_sender,
        ice_candidate_receiver,
    ) = async_std::channel::unbounded::<IceCandidate>();

    let (
        dc_output_sender,
        dc_output_receiver,
    ) = async_std::channel::unbounded::<Vec<u8>>();

    let dc_output_receiver = ChunkDecoder::new(mode)
        .decode_stream(dc_output_receiver)
        .inspect_err(|err| {
            error!("Datachannel Cunk Decoding Error: {:?}", err);
        })
        .take_while(|result| {
            future::ready(result.is_ok())
        })
        .filter_map(|result| async move {
            result.ok()
        });

    let conn = Conn {
        id,
        dc: None,
        sdp_answer_sender,
        ice_candidate_sender: Some(ice_candidate_sender),
    };

    let channel = Channel::Outgoing(OutgoingChannel {
        output: dc_output_sender,
    });

    let mut pc = RtcPeerConnection::new(
        &conf,
        conn,
    )?;

    let mut dc = pc.create_data_channel("graphql", channel)?;

    pc.set_remote_description(&signal.offer)?;

    let dc_input_msgs = handle_data_channel(
        signal,
        Box::pin(dc_output_receiver)
    )
        .await?;

    let mut dc_input_chunks = ChunkEncoder::new(mode)
        .encode_stream(dc_input_msgs)
        .boxed();

    // Run the datachannel in a detached task
    async_std::task::Builder::new()
        .name(format!("data_channel_{}", id))
        .spawn(async move {
            while let Some(msg) = dc_input_chunks.next().await {
                if let Err(err) = dc.send(&msg) {
                    error!("Data Channel {} Exited with Error: {:?}", id, err)
                }
            }
        })?;

    let sdp_answer = sdp_answer_receiver.next()
        .await
        .ok_or_else(|| eyre!("SDP answer not received"))?;

    Ok((
        id,
        pc,
        sdp_answer,
        ice_candidate_receiver,
    ))
}
