use std::{pin::Pin, sync::{Arc}};
use async_tungstenite::{async_std::connect_async, tungstenite::http::Request};
use eyre::{
    eyre,
    Result,
    Context as _,
};
use futures_util::{
    future,
    future::Future,
    future::{
        TryFutureExt,
    },
    stream::{
        Stream,
        StreamExt,
        TryStreamExt,
    },
};
use teg_auth::Signal;

use crate::saltyrtc_chunk::Message;

pub async fn connect_to_client_ws<F, Fut, S>(
    signal: Signal,
    url: String,
    aud: &str,
    server_keys: &Arc<teg_auth::ServerKeys>,
    handle_data_channel: Arc<F>,
) -> Result<()>
where
    F: Fn(
        Signal,
        Pin<Box<dyn Stream<Item = Message> + 'static + Send + Send>>,
    ) -> Fut + Send + Sync + 'static,
    Fut: Future<Output = Result<S>> + Send + 'static,
    S: Stream<Item = Vec<u8>> + Send + 'static,
{
    use crate::saltyrtc_chunk::{
        ReliabilityMode,
        ChunkDecoder,
        ChunkEncoder,
    };

    let Signal {
        session_id,
        ..
    } = &signal;

    let mode = ReliabilityMode::UnreliableUnordered;


    let jwt = server_keys.create_signalling_jwt(aud)?;
    let identity_public_key = &server_keys.identity_public_key;

    let request = Request::builder()
        .uri(&url)
        .header("Authorization", format!("Bearer {}", jwt))
        .header(
            "X-Host-Identity-Public-Key",
            base64::encode(identity_public_key),
        )
        .header(
            "X-Session-ID",
            &session_id.0,
        )
        .body(())
        .wrap_err("Error creating client websocket url")?;

    let (ws_stream, _) = connect_async(request)
        .await
        .map_err(|err|
            eyre!(
                "Unable to connect to ws bridge ({}) (reason: {:?})",
                url,
                err,
            )
        )?;

    let (
        ws_write,
        ws_read,
    ) = ws_stream.split();

    let ws_read = ws_read
        .map(|res| res.wrap_err("websocket read error"))
        .and_then(|ws_msg| {
            use async_tungstenite::tungstenite::Message;

            match ws_msg {
                Message::Binary(msg) => future::ok(msg),
                msg => future::err(eyre!("Unsupported message type: {:?}", msg))
            }
        })
        .inspect_err(|err| {
            warn!("Client websocket read error: {:?}", err);
        })
        .take_while(|result| {
            future::ready(result.is_ok())
        })
        .filter_map(|result| async move {
            result.ok()
        });

    let dechunked_read = ChunkDecoder::new(mode)
        .decode_stream(ws_read)
        .inspect_err(|err| {
            warn!("Datachannel Cunk Decoding Error: {:?}", err);
        })
        .take_while(|result| {
            future::ready(result.is_ok())
        })
        .filter_map(|result| async move {
            result.ok()
        });

    // Run the datachannel in a detached task
    async_std::task::Builder::new()
        .name(format!("client_ws:{}", &session_id.0))
        .spawn(
            async move {
                let dc_input_msgs = handle_data_channel(
                    signal,
                    Box::pin(dechunked_read)
                )
                    .await?;

                use async_tungstenite::tungstenite::Message;

                ChunkEncoder::new(mode)
                    .encode_stream(dc_input_msgs)
                    .map(|msg| Ok(Message::Binary(msg)))
                    .forward(ws_write)
                    .await?;

                info!("Client disconnected");
                eyre::Result::<()>::Ok(())
            }
            .map_err(|err| warn!("client ws error: {:?}", err))
        )
        .wrap_err("Error creating client ws task")?;

    Ok(())
}
