use std::time::Duration;
use async_std::future;
use serde::{
    Serialize,
    Deserialize,
};
use anyhow::{
    anyhow,
    Result,
    Context as _,
};

pub mod video_mutation_resolvers;
pub mod video_query_resolvers;

#[derive(async_graphql::SimpleObject, Debug, Serialize, Deserialize)]
pub struct IceCandidate {
    pub candidate: String,
    #[graphql(name = "sdpMLineIndex")]
    #[serde(rename = "sdpMLineIndex")]
    pub sdp_mline_index: i32,
    #[serde(rename = "sdpMid")]
    pub sdp_mid: String,
}

#[derive(async_graphql::SimpleObject, Debug, Serialize, Deserialize)]
pub struct Media {
    video: String,
}

const WEBRTC_STREAMER_API: &'static str = "http://localhost:8009/api";

pub async fn get_ice_candidates(
    video_session_id: &String,
) -> Result<Vec<IceCandidate>> {
    let req = surf::get(&format!("{api_url}/getIceCandidate", api_url = WEBRTC_STREAMER_API))
        .query(&[
            ("peerid", video_session_id),
        ])
        .map_err(|err| anyhow!(err))? // TODO: Remove me when surf 2.0 is released
        .recv_json();

    let ice_candidates = future::timeout(Duration::from_millis(5_000), req)
        .await?
        .map_err(|err| anyhow!(err)) // TODO: Remove me when surf 2.0 is released
        .with_context(|| "Unable to get ice candidates")?;

    info!("ICE: {:?}", ice_candidates);

    Ok(ice_candidates)
}
