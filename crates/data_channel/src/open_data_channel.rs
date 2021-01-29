use std::{pin::Pin, sync::atomic::{ AtomicU64, Ordering }};
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use async_std::task::block_on;
use datachannel::{
    Config,
    ConnectionState,
    DataChannel,
    GatheringState,
    IceCandidate,
    PeerConnection,
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

static NEXT_ID: AtomicU64 = AtomicU64::new(0);

#[derive(Clone)]
struct OutgoingChannel {
    output: async_std::channel::Sender<Vec<u8>>,
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
    //         block_on(|| async {
    //             ready.send(()).await
    //         });
    //     }
    // }

    fn on_message(&mut self, msg: &[u8]) {
        if let Channel::Outgoing(channel) = self {
            // let msg = String::from_utf8_lossy(msg).to_string();
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

struct Conn {
    id: u64,
    dc: Option<Box<RtcDataChannel<Channel>>>,
    sdp_answer_sender: async_std::channel::Sender<SessionDescription>,
    ice_candidate_sender: async_std::channel::Sender<IceCandidate>,
}

impl PeerConnection for Conn {
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

        let ice_candidate_sender = self.ice_candidate_sender.clone();
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
}

pub async fn open_data_channel<F, Fut, S>(
    remote_description: SessionDescription,
    handle_data_channel: &F,
) -> Result<(
    SessionDescription,
    impl Stream<Item = IceCandidate>,
)>
where
    F: Fn(Pin<Box<dyn Stream<Item = Vec<u8>> + 'static + Send + Sync>>) -> Fut + 'static,
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

    let ice_servers = vec!["stun:stun.l.google.com:19302".to_string()];
    let conf = Config::new(ice_servers);

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
        sdp_answer,
        ice_candidate_receiver,
    ))
}
