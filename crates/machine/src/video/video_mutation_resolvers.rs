use std::{sync::Arc, time::{SystemTime, UNIX_EPOCH, Duration}};

use async_graphql::{
    Context,
    FieldResult,
    ID,
};
use eyre::{
    eyre,
    // Result,
    Context as _,
};
use async_std::{future, sync::Mutex, process::Command};
use serde::{
    Serialize,
    Deserialize,
};
use teg_auth::{
    AuthContext,
};
// use teg_json_store::Record;

use crate::machine::{
    // MachineViewer,
    messages,
};
use super::{
    IceCandidate,
    WEBRTC_STREAMER_API,
    get_ice_candidates,
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
    pub reset: bool,
}

#[derive(async_graphql::SimpleObject, Debug, Deserialize, Clone)]
pub struct RTCSignal {
    pub r#type: String,
    pub sdp: String,
}

#[derive(async_graphql::SimpleObject, Debug)]
pub struct VideoSession {
    pub id: ID,
    pub answer: RTCSignal,
    #[graphql(name = "iceCandidates")]
    pub ice_candidates: Vec<IceCandidate>,
}

#[derive(Serialize, Debug)]
struct VideoCallQueryParams<'a> {
    peerid: &'a String,
    url: &'a String,
    options: &'static str,
}

lazy_static! {
    static ref LAST_RESET: Arc<Mutex<SystemTime>> = Arc::new(Mutex::new(UNIX_EPOCH));
}

const RESET_TIMEOUT: Duration = Duration::from_secs(30);

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

        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let machine = machines.get(&input.machine_id)
            .ok_or_else(|| eyre!("Machine ({:?}) not found", input.machine_id))?;

        let machine = machine.call(messages::GetData).await??;

        // WebRTC streamer some times stops connecting to WebRTC peers. In that case a client
        // can request a reset of the server at most once every 30 seconds.
        if input.reset {
            let now = SystemTime::now();
            let mut previous_reset = LAST_RESET.lock().await;

            let time_since = now
                .duration_since(*previous_reset)
                .expect("Time went backwards");

            if time_since > RESET_TIMEOUT {
                *previous_reset = now;

                Command::new("systemctl")
                    .args(["restart", "printspool-webrtc-streamer"])
                    .output()
                    .await
                    .expect("failed to execute webrtc_streamer reset");

                // Wait for the webrtc streamer to restart
                async_std::task::sleep(Duration::from_millis(500)).await;
            }
        }

        async move {
            let video_session_id = format!(
                "{user_id}.{id}",
                user_id = user.id,
                id = nanoid!(11),
            );

            let video_id = input.video_id.to_string();
            let video = machine
                .config
                .videos
                .iter()
                .find(|video| video.id == video_id)
                .ok_or(eyre!("No video source configured"))?;

            info!("creating video sdp for: {}", video.model.source);

            /*
            * Query the webrtc-streamer
            */
            let url = &format!("{api_url}/call", api_url = WEBRTC_STREAMER_API);
            let req = surf::post(url)
                .body(serde_json::to_value(&input.offer)?)
                .query(&VideoCallQueryParams {
                    peerid: &video_session_id,
                    url: &video.model.source,
                    options: "rtptransport=tcp&timeout=60",
                })
                .map_err(|err| eyre!(err))? // TODO: Remove me when surf 2.0 is released
                .recv_json();

            let answer = future::timeout(std::time::Duration::from_millis(5_000), req)
                .await
                .wrap_err("Creating video call timed out")?
                .map_err(|err| eyre!(err)) // TODO: Remove me when surf 2.0 is released
                .wrap_err("Error relaying call to video streaming server")?;

            let ice_candidates = get_ice_candidates(&video_session_id).await?;

            eyre::Result::<_>::Ok(VideoSession {
                id: video_session_id.into(),
                answer,
                ice_candidates,
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
