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
use async_std::future;
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
    pub machine_id: ID,
    pub video_id: ID,
    pub offer: RtcSignalInput,
}

#[derive(async_graphql::SimpleObject, Debug, Deserialize, Clone)]
pub struct RTCSignal {
    #[graphql(name = "type")]
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

#[async_graphql::Object]
impl VideoMutation {
    // Video
    #[graphql(name = "createVideoSDP")]
    #[instrument(skip(self, ctx))]
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

        let video_session_id = format!(
            "{user_id}:{id}",
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
        let req = surf::post(&format!("{api_url}/call", api_url = WEBRTC_STREAMER_API))
            .body(serde_json::to_value(&input.offer)?)
            .query(&[
                ("peerid", &video_session_id[..]),
                ("url", &video.model.source[..]),
                ("options", "rtptransport=tcp&timeout=60"),
            ])?
            .recv_json();

        let answer = future::timeout(std::time::Duration::from_millis(5_000), req)
            .await
            .wrap_err("Creating video call timed out")?
            .map_err(|err| eyre!(err)) // TODO: Remove me when surf 2.0 is released
            .wrap_err("Error creating video call")?;

        let ice_candidates = get_ice_candidates(&video_session_id).await?;

        Ok(VideoSession {
            id: video_session_id.into(),
            answer,
            ice_candidates,
        })
    }
}
