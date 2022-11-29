#[macro_use]
extern crate lazy_static;

use bytes::Bytes;
use eyre::Result;
use futures::FutureExt;
use std::io::Write;
use std::path::Path;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;
use tokio::sync::Notify;
use tokio::time::Duration;
use tracing::warn;
use webrtc::api::interceptor_registry::register_default_interceptors;
use webrtc::api::media_engine::{MediaEngine, MIME_TYPE_H264};
use webrtc::api::setting_engine::SettingEngine;
use webrtc::api::APIBuilder;
use webrtc::ice::udp_network::{EphemeralUDP, UDPNetwork};
use webrtc::ice_transport::ice_connection_state::RTCIceConnectionState;
use webrtc::ice_transport::ice_server::RTCIceServer;
use webrtc::interceptor::registry::Registry;
use webrtc::media::Sample;
use webrtc::peer_connection::configuration::RTCConfiguration;
use webrtc::peer_connection::peer_connection_state::RTCPeerConnectionState;
use webrtc::peer_connection::sdp::session_description::RTCSessionDescription;
use webrtc::rtp_transceiver::rtp_codec::RTCRtpCodecCapability;
use webrtc::track::track_local::track_local_static_sample::TrackLocalStaticSample;
use webrtc::track::track_local::TrackLocal;

pub struct VideoCaptureStream {
    pub device_path: PathBuf,
    pub track: Arc<TrackLocalStaticSample>,
    pub abort_handle: AbortHandle,
    pub timelapse_file_tx: tokio::sync::mpsc::UnboundedSender<std::fs::File>,
    pub timelapse_frame_req_flag: AtomicBool,
}

// // Timelapse example useage
// video_capture.timelapse_file_tx
//     .send(std::fs::File::create("./test.h264").unwrap())
//     .unwrap();

// std::thread::spawn(move || loop {
//     video_capture.timelapse_frame_req_flag.store(true, std::sync::atomic::Ordering::Relaxed);
//     std::thread::sleep(std::time::Duration::from_millis(500));
// });

impl VideoCaptureStream {
    fn new(device_path: PathBuf) -> Result<Self> {
        let max_fps = 60;

        // Create a video track
        let track_id = device_path.as_path().to_string_lossy().to_string();
        let stream_id = "stream_".to_string() + track_id;
        let video_track = Arc::new(TrackLocalStaticSample::new(
            RTCRtpCodecCapability {
                mime_type: MIME_TYPE_H264.to_owned(),
                ..Default::default()
            },
            track_id,
            stream_id,
        ));

        println!("stream video from camera: {:?}", device_path);

        let (timelapse_file_tx, mut timelapse_file_rx) =
            tokio::sync::mpsc::unbounded_channel::<std::fs::File>();

        let timelapse_frame_req_flag = Arc::new(AtomicBool::new(false));

        let (abort_handle, abort_registration) = AbortHandle::new_pair();

        let pool = tokio_util::task::LocalPoolHandle::new(1);

        let device_path = device_path.into_path_buf();
        let device_path_clone = device_path.clone();
        let video_track_clone = Arc::clone(&video_track);
        let timelapse_frame_req_flag_clone = Arc::clone(&timelapse_frame_req_flag);

        pool.spawn_pinned(move || {
            let video_capture_future = async move {
                // Connect to the webcam
                let mut device = h264_webcam_stream::get_device(&device_path_clone)?;
                let mut stream = h264_webcam_stream::stream(&mut device, max_fps)?;

                // Set up an encoder for re-encoding the timelapse video
                let h264_encoder_config =
                    openh264::encoder::EncoderConfig::new(stream.width, stream.height);
                let mut timelapse_encoder =
                    openh264::encoder::Encoder::with_config(h264_encoder_config)?;

                let mut timelapse_file = None;

                // It is important to use a time.Ticker instead of time.Sleep because
                // * avoids accumulating skew, just calling time.Sleep didn't compensate for the time spent parsing the data
                // * works around latency issues with Sleep
                let mut ticker = tokio::time::interval(Duration::from_millis(33));

                loop {
                    let (h264_bitstream, yuv_frame) = stream.next(true)?;

                    // Record a single timelapse frame each time the timelapse frame request flag is set
                    use std::sync::atomic::Ordering;
                    if let Some(yuv_frame) = yuv_frame {
                        if timelapse_frame_req_flag_clone
                            .compare_exchange(true, false, Ordering::Acquire, Ordering::Relaxed)
                            .is_ok()
                        {
                            let timelapse_h264_bytes =
                                yuv_frame.encode_using(&mut timelapse_encoder)?.to_vec();

                            // Update the timelapse file that will be output to if it has been changed
                            timelapse_file = timelapse_file_rx.try_recv().ok().or(timelapse_file);
                            if let Some(f) = timelapse_file.as_mut() {
                                // Write the timelapse h264 output to file
                                f.write_all(&timelapse_h264_bytes[..])?;
                            } else {
                                warn!("Timelapse frame requested but no timelapse file selected");
                            }
                        }
                    }

                    // Convert the video bitstream into WebRTC's format
                    let samples = openh264::nal_units(&h264_bitstream[..])
                        .map(|nal| Sample {
                            data: Bytes::copy_from_slice(nal),
                            duration: Duration::from_secs(1),
                            ..Default::default()
                        })
                        .collect::<Vec<_>>();

                    // Send the video to WebRTC clients
                    for sample in samples {
                        video_track_clone.write_sample(&sample).await?;
                    }

                    let _ = ticker.tick().await;
                }

                #[allow(unreachable_code)]
                Result::<()>::Ok(())
            };

            // Handle restarting the video capture loop if something goes wrong
            let video_capture_future = async move || loop {
                video_capture_future.map(|res| {
                    error!(
                        "Video stream task exited with error, restarting in 500ms: {:?}",
                        res
                    )
                });
                sleep(500).await;
            };

            // Allow the video capture loop to be aborted externally once it is no longer needed
            Abortable::new(video_capture_future, abort_registration)
        });

        Ok(Self {
            device_path,
            track,
            abort_handle,
            timelapse_file_tx,
            timelapse_frame_req_flag,
        })
    }
}
