// use chrono::prelude::*;
use juniper::{
    FieldResult,
    // FieldError,
};
use serde::{
    Serialize,
    Deserialize,
};

// use crate::models::{ Invite };
use crate::{ Context };

#[derive(juniper::GraphQLObject, Debug, Serialize, Deserialize)]
pub struct RTCSignal {
    #[graphql(
        name = "type",
    )]
    pub r#type: String,
    pub sdp: String,
}

#[derive(juniper::GraphQLObject, Debug, Serialize, Deserialize)]
pub struct VideoSession {
    pub id: String,
    pub answer: RTCSignal,
}

#[derive(juniper::GraphQLObject, Debug, Serialize, Deserialize)]
pub struct IceCandidate {
    pub candidate: String,
    #[graphql(name = "sdpMLineIndex")]
    #[serde(rename = "sdpMLineIndex")]
    pub sdp_mline_index: i32,
    #[serde(rename = "sdpMid")]
    pub sdp_mid: String,
}

#[derive(juniper::GraphQLInputObject, Debug, Serialize, Deserialize)]
pub struct RTCSignalInput {
    pub r#type: String,
    pub sdp: String,
}

const webrtc_streamer_api: &'static str = "http://localhost:8009/api";

pub async fn create_video_sdp(
    context: &Context,
    offer: RTCSignalInput,
// ) -> FieldResult<RTCSignal> {
) -> FieldResult<VideoSession> {
    let user = context.current_user
        .as_ref()
        .ok_or("Unauthorized to create video SDP")?;

    let id = format!("{}_{}", user.id, rand::random::<u32>().to_string());

    /*
    * Query the webrtc-streamer
    */
    let answer: RTCSignal = reqwest::blocking::Client::new()
        .post(&format!("{}/call", webrtc_streamer_api))
        .json(&offer)
        .query(&[
            ("peerid", id.clone()),
            // TODO: configurable video source
            ("url", "videocap://1".to_string()),
            // ("url", "mmal service 16.1".to_string()),
            ("options", "rtptransport=tcp&timeout=60".to_string()),
        ])
        .send()?
        // .await?
        .json()?;
        // .await?;

    // // use std::sync::Arc;
    // // let id = Arc::new(id);
    // loop {
    //     // let id = Arc::clone(&id);
    //     let ice_candidates: Vec<IceCandidate> = reqwest::blocking::Client::new()
    //         .post(&format!("{}/getIceCandidate", webrtc_streamer_api))
    //         .json(&offer)
    //         .query(&[
    //             ("peerid", id.clone()),
    //         ])
    //         .send()?
    //         // .await?
    //         .json()?;
    //         // .await?;
    //
    //     info!("ICE: {:?}", ice_candidates);
    //
    //     use async_std::task;
    //     task::sleep(std::time::Duration::from_millis(500)).await;
    // };

    Ok(VideoSession {
        id,
        answer,
    })
    // Ok(answer)
}

pub async fn get_ice_candidates(
    context: &Context,
    id: String,
) -> FieldResult<Vec<IceCandidate>> {
    let user = context.current_user
        .as_ref()
        .ok_or("Unauthorized to create video SDP")?;

    if !id.starts_with(&format!("{}_", user.id).to_string()) {
        Err("Invalid Video Session ID")?;
    }

    /*
    * Query the webrtc-streamer
    */
    // let id = Arc::clone(&id);
    let ice_candidates: Vec<IceCandidate> = reqwest::blocking::Client::new()
        .get(&format!("{}/getIceCandidate", webrtc_streamer_api))
        .query(&[
            ("peerid", id.clone()),
        ])
        .send()?
        // .await?
        .json()?;
        // .await?;

    info!("ICE: {:?}", ice_candidates);

    Ok(ice_candidates)
}
