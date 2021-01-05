use anyhow::{
    anyhow,
    Result,
    // Context as _,
};
use datachannel::{
    Config,
    DataChannel,
    PeerConnection,
    RtcPeerConnection,
    SessionDescription,
    IceCandidate,
    ConnectionState,
    GatheringState,
};

#[derive(Clone)]
struct Chan;
impl DataChannel for Chan {}

struct Conn;
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

        // self.signaling
        //     .try_send(Message::binary(serde_json::to_vec(&peer_msg).unwrap()))
        //     .ok();
    }

    fn on_candidate(&mut self, cand: IceCandidate) {
        // log::info!("Candidate {}: {} {}", self.id, &cand.candidate, &cand.mid);
        // self.signaling.send(PeerMsg::RemoteCandidate { cand }).ok();
    }

    fn on_connection_state_change(&mut self, state: ConnectionState) {
        // log::info!("State {}: {:?}", self.id, state);
    }

    fn on_gathering_state_change(&mut self, state: GatheringState) {
        // log::info!("Gathering state {}: {:?}", self.id, state);
    }
}

pub fn openDataChannel(remote_description: SessionDescription) -> Result<()> {
    let ice_servers = vec!["stun:stun.l.google.com:19302".to_string()];
    let conf = Config::new(ice_servers);

    let mut pc = RtcPeerConnection::new(&conf, Conn, Chan)?;

    let mut dc = pc.create_data_channel("graphql", Chan)?;
    dc.send("Hello Peer!".as_bytes())?;

    pc.set_remote_description(&remote_description)?;

    Ok(())
}

async fn connectToSignallingServer() -> Result<()> {
    use async_tungstenite::{
        async_std::connect_async,
        tungstenite::Message,
        tungstenite::handshake::client::Request,
    };
    use futures_util::{
        StreamExt,
        SinkExt,
    };

    let request = Request::builder()
        .uri("wss://echo.websocket.org")
        .header("Authorization", "test123")
        .body(())?;

    let (mut ws_stream, _) = connect_async(request).await?;

    let text = "Hello, World!";

    println!("Sending: \"{}\"", text);
    ws_stream.send(Message::text(text)).await?;

    let msg = ws_stream
        .next()
        .await
        .ok_or_else(|| anyhow!("didn't receive anything"))??;

    Ok(())
}
