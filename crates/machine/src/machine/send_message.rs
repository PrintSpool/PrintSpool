use async_std::prelude::*;
use futures::SinkExt;
use async_codec::framed_std::WriteFrameError;

use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use teg_protobufs::{
    CombinatorMessage,
};

use super::Machine;

impl Machine {
    pub async fn send_message(&mut self, message: CombinatorMessage) -> Result<()> {
        let stream = self.write_stream
            .as_mut()
            .ok_or_else(|| anyhow!("Machine write stream not initialized"))?;

        // Note: If blocking weirdness crops up we may need to reimplement this hack.
        // Not sure if it is mitigated against by the Framed stream and using poll_write
        // instead of write_all.

        // // Prevent write_all from blocking the executor
        // // Per https://rickyhan.com/jekyll/update/2019/12/22/convert-to-async-rust.html
        // async_std::future::timeout(
        //     std::time::Duration::from_millis(0),
        //     stream.write_all(&buf)
        // ).await??;

        match stream.send(message).await {
            Err(WriteFrameError::Io(err)) => Err(err)?,
            Err(WriteFrameError::Encode(err)) => Err(err)?,
            _ => (),
        };

        info!("Sent Protobuf");

        Ok(())
    }
}
