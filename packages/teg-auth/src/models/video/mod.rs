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
pub struct RTCSessionDescription {
    #[graphql(
        name = "type",
    )]
    pub r#type: String,
    pub sdp: String,
}

#[derive(juniper::GraphQLInputObject, Debug, Serialize, Deserialize)]
pub struct RTCSessionDescriptionInput {
    pub r#type: String,
    pub sdp: String,
}

pub async fn create_video_sdp(
    _context: &Context,
    offer: RTCSessionDescriptionInput,
) -> FieldResult<RTCSessionDescription> {
    let webrtc_streamer_url = "http://localhost:8009/api/call";

    // TODO: Math.random peerID
    let peer_id = rand::random::<f32>().to_string();

    /*
    * Query the webrtc-streamer
    */
    let answer: RTCSessionDescription = reqwest::blocking::Client::new()
        .post(webrtc_streamer_url)
        .json(&offer)
        .query(&[
            ("peerid", peer_id),
            // TODO: configurable video source
            // ("url", "videocap://1".to_string()),
            ("url", "mmal service 16.1".to_string()),
            ("options", "rtptransport=tcp&timeout=60".to_string()),
        ])
        .send()?
        // .await?
        .json()?;
        // .await?;

    Ok(answer)
}
