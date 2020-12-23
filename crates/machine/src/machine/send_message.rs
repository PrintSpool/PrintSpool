use async_std::prelude::*;
// use async_std::os::unix::net::UnixStream;

use anyhow::{
    anyhow,
    Result,
    Context as _,
};
use bytes::BufMut;

use teg_protobufs::{
    CombinatorMessage,
    Message,
};

use super::Machine;

impl Machine {
    pub async fn send_message(&mut self, message: CombinatorMessage) -> Result<()> {
        let stream = &mut self.write_stream
            .as_ref()
            .ok_or_else(|| anyhow!("Machine write stream not initialized"))?;

        const SIZE_DELIMETER_BYTES: usize = 4;
        let mut buf = Vec::with_capacity(
            message.encoded_len() + SIZE_DELIMETER_BYTES,
        );
        buf.put_u32_le(message.encoded_len() as u32);

        message.encode(&mut buf)
            .with_context(|| "combinator message encoding failed")?;

        info!("Sending Protobuf (Len: {} {})", buf.len(), buf.len() as u32);

        // Prevent write_all from blocking the executor
        // Per https://rickyhan.com/jekyll/update/2019/12/22/convert-to-async-rust.html
        async_std::future::timeout(
            std::time::Duration::from_millis(0),
            stream.write_all(&buf)
        ).await??;

        // stream.write_all(&buf).await?;

        info!("Sent Protobuf");

        Ok(())
    }
}
