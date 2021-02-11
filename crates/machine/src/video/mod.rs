use std::time::Duration;
use async_std::future;
use serde::{
    Serialize,
    Deserialize,
};
use eyre::{
    eyre,
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

#[derive(Serialize, Debug)]
struct VideoIceCandidatesQueryParams<'a> {
    peerid: &'a String,
}

pub async fn get_ice_candidates(
    video_session_id: &String,
) -> Result<Vec<IceCandidate>> {
    let url = format!("{api_url}/getIceCandidate", api_url = WEBRTC_STREAMER_API);
    let req = surf::get(&url)
        .query(&VideoIceCandidatesQueryParams {
            peerid: video_session_id,
        })
        .map_err(|err| eyre!(err))? // TODO: Remove me when surf 2.0 is released
        .recv_json();

    let ice_candidates = future::timeout(Duration::from_millis(5_000), req)
        .await
        .wrap_err("Getting video ice candidates timed out")?
        .map_err(|err| eyre!(err)) // TODO: Remove me when surf 2.0 is released
        .wrap_err("Error getting video ice candidates")?;

    trace!("Video ICE Candidates: {:?}", ice_candidates);

    Ok(ice_candidates)
}
