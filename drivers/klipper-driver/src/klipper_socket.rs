use async_trait::async_trait;
use bonsaidb::core::{define_basic_unique_mapped_view, schema::Collection};
use chrono::{DateTime, Utc};
use futures_util::{future::Either, stream::StreamExt};
use printspool_driver_interface::{driver_instance::LocalDriverInstance, DbId};
use tokio::{
    net::unix::{OwnedWriteHalf, WriteHalf},
    sync::mpsc,
};
use tokio_util::codec::{FramedRead, FramedWrite};
use validator::Validate;

struct KlipperSocket {
    msg_tx: mpsc::Sender<Req>,
}

impl KlipperSocket {
    pub async fn start(on_shutdown: Fn(Result<()>)) -> Result<Self> {
        let (msg_tx, mut msg_rx) = mpsc::channel::<Req>(100);

        tokio::spawn(async move {
            let callbacks = HashMap::new();
            let res = Self::socket_loop(msg_rx, callbacks).await;

            if let Err(err) = res {
                // Relay the error to any callback listeners
                for callback in callbacks {
                    callback.send(Err(err.clone()));
                }
            }
            on_shutdown(res);
        });

        Ok(Self { msg_tx })
    }

    /// Send a command but do not await it's response
    pub async fn send(cmd: serde_json::Value) -> Result<()> {
        self.msg_tx.send((cmd, Callback::None)).await?;
        Ok(())
    }

    /// Run a command and await it's response
    pub async fn execute(cmd: serde_json::Value) -> Result<()> {
        let (tx, rx) = oneshot::channel();
        self.msg_tx.send((cmd, Callback::Oneshot(tx))).await?;
        let res = rx.await?;
        Ok(res)
    }

    async fn socket_loop(
        requests: mpsc::Receiver<Req>,
        callbacks: &mut Vec<Callback>,
    ) -> Result<()> {
        let (socket_read, socket_write) = UnixStream::connect(unix_socket_path).await?.into_split();

        let codec = AnyDelimiterCodec::new_with_max_length(vec![0x03], vec![0x03], 1_000_000);

        let socket_read = FramedRead::new(socket_read, codec);
        let socket_write = FramedWrite::new(socket_write, codec);

        // Randomize the starting ID to reduce the chance of the driver re-using the same ID after a process restart.
        let next_id = Wrapping(rand::random::<u32>());

        loop {
            // Receiving messages is prioritized over sending messages to prevent denial-of-service due to request flooding
            match future_util::select(socket_read.next(), requests.next()) {
                Either::Right(request) => {
                    let (msg, callback) = request;

                    // Prevent excessive callbacks from being queued
                    if callbacks.len() >= 1000 {
                        callback.send(Err(eyre!(
                            "Klipper not responding (Max callbacks exceeded)"
                        )));
                    }

                    // Set a message ID
                    let msg = KlipperMessage {
                        id: next_id += 1,
                        payload: msg,
                    };

                    // Queue the callback and send the message to Klipper
                    callbacks.insert(msg.id, callback);
                    socket_write.send(serde_json::to_string(&msg)?).await;
                }
                Either::Left(response) => {
                    // Parse the response
                    let response: KlipperMessage = serde_json::from_str(&response);

                    // Get the callback by the message id
                    let Some(callback) = callbacks.remove(response.id) else {
                        warn!("Callback not found for id ({}), message: {:?}", response.id, response.payload);
                        continue;
                    };

                    // Relay the message to the callback
                    callback.send(Ok(response.payload)).await;
                }
            }
        }
    }
}

#[derive(Serialize, Deserialize)]
struct KlipperMessage {
    id: u32,
    #[serde(flatten)]
    payload: serde_json::Value,
}

/// A message to be sent to Klipper combined with an async callback for the response
pub type Req = (serde_json::Value, Callback);

pub enum Callback {
    Oneshot(oneshot::Sender<Result<serde_json::Value>>),
    Stream(mpsc::Sender<Result<serde_json::Value>>),
    None,
}

impl Callback {
    pub async fn send(self, response: Result<serde_json::Value>) {
        match self {
            Callback::Oneshot(oneshot) => {
                // Ignore the error if the receiver has stopped listening for a response
                let _ = oneshot.send(response).await;
            }
            Callback::Stream(stream) => stream.send(response).await,
            Callback::None => {}
        }
    }
}
