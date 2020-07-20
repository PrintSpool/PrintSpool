use std::time::Duration;
use async_graphql::*;
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

use crate::{ Context };

#[SimpleObject]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RTCSignal {
    #[field(name = "type")]
    pub r#type: String,
    pub sdp: String,
}

#[SimpleObject]
#[derive(Debug, Serialize, Deserialize)]
pub struct VideoSession {
    pub id: ID,
    pub answer: RTCSignal,
    #[field(name = "iceCandidates")]
    pub ice_candidates: Vec<IceCandidate>,
}

#[SimpleObject]
#[derive(Debug, Serialize, Deserialize)]
pub struct IceCandidate {
    pub candidate: String,
    #[field(name = "sdpMLineIndex")]
    #[serde(rename = "sdpMLineIndex")]
    pub sdp_mline_index: i32,
    #[serde(rename = "sdpMid")]
    pub sdp_mid: String,
}


#[InputObject]
#[derive(Debug, Serialize, Deserialize)]
pub struct RTCSignalInput {
    pub r#type: String,
    pub sdp: String,
}

#[SimpleObject]
#[derive(Debug, Serialize, Deserialize)]
pub struct Media {
    video: String,
}

#[SimpleObject]
#[derive(Debug, Serialize, Deserialize)]
pub struct VideoSource {
    id: ID,
}

const WEBRTC_STREAMER_API: &'static str = "http://localhost:8009/api";

pub async fn get_video_sources(
    _context: &Context,
) -> FieldResult<Vec<VideoSource>> {
    let req = surf::post(&format!("{}/getMediaList", WEBRTC_STREAMER_API))
        .recv_json();

    let media_list: Vec<Media> = future::timeout(Duration::from_millis(5_000), req)
        .await??;

    let video_providers = media_list.into_iter()
        .map(|media| VideoSource {
            id: media.video.into()
        })
        .collect();

     Ok(video_providers)
}

pub async fn create_video_sdp(
    context: &Context,
    offer: RTCSignalInput,
) -> Result<VideoSession> {
    let user = context.current_user
        .as_ref()
        .ok_or(anyhow!("Unauthorized to create video SDP"))?;

    let id = format!("{}_{}", user.id.to_string(), rand::random::<u32>().to_string());

    // TODO: multiple video sources
    let source_url = context.machine_config
        .read()
        .await
        .get_videos()
        .next()
        .ok_or(anyhow!("No video source configured"))?
        .source
        .to_owned();

    info!("creating video sdp for: {}", source_url);
    info!("offer: {:?}", offer);

    /*
    * Query the webrtc-streamer
    */
    let req = surf::post(&format!("{}/call", WEBRTC_STREAMER_API))
        .body_json(&offer)?
        .set_query(&[
            ("peerid", id.to_string()),
            ("url", source_url),
            ("options", "rtptransport=tcp&timeout=60".to_string()),
        ])?
        .recv_json();

    let answer = future::timeout(Duration::from_millis(5_000), req)
        .await?
        .map_err(|err| anyhow!(err)) // TODO: Remove me when surf 2.0 is released
        .with_context(|| "Unable to create video call")?;

    let ice_candidates = get_ice_candidates(&context, id.clone().into())
        .await?;

    Ok(VideoSession {
        id: id.into(),
        answer,
        ice_candidates,
    })
}

pub async fn get_ice_candidates(
    context: &Context,
    id: ID,
) -> Result<Vec<IceCandidate>> {
    // Ok(vec![])
    let user = context.current_user
        .as_ref()
        .ok_or(anyhow!("Unauthorized to create video SDP"))?;

    if !id.starts_with(&format!("{}_", user.id.to_string()).to_string()) {
        Err(anyhow!("Invalid Video Session ID"))?;
    }

    /*
    * Query the webrtc-streamer
    */
    let req = surf::get(&format!("{}/getIceCandidate", WEBRTC_STREAMER_API))
        .set_query(&[
            ("peerid", id.to_string()),
        ])?
        .recv_json();

    let ice_candidates = future::timeout(Duration::from_millis(5_000), req)
        .await?
        .map_err(|err| anyhow!(err)) // TODO: Remove me when surf 2.0 is released
        .with_context(|| "Unable to get ice candidates")?;

    info!("ICE: {:?}", ice_candidates);

    Ok(ice_candidates)
}
