use super::{get_ice_candidates, video_capture_stream, IceCandidate, WEBRTC_STREAMER_API};
use crate::machine::messages;
use async_graphql::{Context, FieldResult, ID};
use async_std::{future, process::Command, sync::Mutex};
use eyre::{
    eyre,
    // Result,
    Context as _,
};
use nanoid::nanoid;
use printspool_auth::AuthContext;
use serde::{Deserialize, Serialize};
use std::{
    sync::Arc,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

#[derive(Default)]
pub struct VideoMutation;

#[derive(async_graphql::InputObject, Debug, Serialize)]
#[graphql(name = "RTCSignalInput")]
pub struct RtcSignalInput {
    pub r#type: String,
    pub sdp: String,
}

#[derive(async_graphql::InputObject, Debug)]
#[graphql(name = "CreateVideoSDPInput")]
pub struct CreateVideoSdpInput {
    #[graphql(name = "machineID")]
    pub machine_id: ID,
    #[graphql(name = "videoID")]
    pub video_id: ID,
    pub offer: RtcSignalInput,
}

#[derive(async_graphql::SimpleObject, Debug, Serialize, Deserialize, Clone)]
pub struct RTCSignal {
    pub r#type: String,
    pub sdp: String,
}

#[derive(async_graphql::SimpleObject, Debug)]
pub struct VideoSession {
    pub id: ID,
    pub answer: RTCSignal,
}

#[derive(Serialize, Debug)]
struct VideoCallQueryParams<'a> {
    peerid: &'a String,
    url: &'a String,
    options: &'static str,
}

#[async_graphql::Object]
impl VideoMutation {
    // Video
    #[graphql(name = "createVideoSDP")]
    #[instrument(skip(self, input, ctx))]
    async fn create_video_sdp<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: CreateVideoSdpInput,
    ) -> FieldResult<VideoSession> {
        let auth: &AuthContext = ctx.data()?;

        let user = auth.require_authorized_user()?;

        let video_capture_streams: &crate::VideoCaptureStreamMap = ctx.data()?;
        let webrtc_sessions: &crate::WebRTCSessionSet = ctx.data()?;

        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let machine = machines
            .get(&input.machine_id)
            .ok_or_else(|| eyre!("Machine ({:?}) not found", input.machine_id))?;

        let machine = machine.call(messages::GetData).await??;

        async move {
            let video_id = input.video_id.to_string();

            let video = machine
                .config
                .videos
                .iter()
                .find(|video| video.id == video_id)
                .ok_or(eyre!("No video source configured"))?;

            info!("creating video sdp for: {}", video.model.source);

            // Get or create the video capture stream
            let device_path: PathBuf = video.model.source.into();

            let video_capture_stream = video_capture_streams
                .entry(&device_path)
                .or_try_insert_with(|| VideoCaptureStream::new(device_path))?;

            // Create the webrtc session
            let mut ephemeral_udp = EphemeralUDP::default();
            ephemeral_udp.set_ports(4300, 4500)?;

            let video_tracks = vec![video_capture_stream.track];

            let offer = serde_json::from_value::<RTCSessionDescription>(&serde_json::to_value(
                input.offer,
            )?)?;

            let (_, answer) = WebRTCSession::new(video_tracks, ephemeral_udp).await?;

            let answer = serde_json::from_value(&serde_json::to_value(answer)?)?;

            eyre::Result::<_>::Ok(VideoSession {
                id: nanoid!(),
                answer,
            })
        }
        // log the backtrace which is otherwise lost by FieldResult
        .await
        .map_err(|err| {
            warn!("{:?}", err);
            err.into()
        })
    }
}
