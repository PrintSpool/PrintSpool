use async_std::prelude::*;
use async_std::os::unix::net::UnixStream;

use anyhow::{
    // anyhow,
    Result,
    Context as _,
};
use bytes::BufMut;

use teg_protobufs::{
    CombinatorMessage,
    Message,
};

pub async fn send_message(stream: &mut UnixStream, message: CombinatorMessage) -> Result<()> {
    const SIZE_DELIMETER_BYTES: usize = 4;
    let mut buf = Vec::with_capacity(
        message.encoded_len() + SIZE_DELIMETER_BYTES,
    );
    buf.put_u32_le(message.encoded_len() as u32);

    message.encode(&mut buf)
        .with_context(|| "combinator message encoding failed")?;

    info!("Sending Protobuf (Len: {} {})", buf.len(), buf.len() as u32);
    info!("Writing: {:?}", buf);

    stream.write_all(&buf).await?;

    info!("Sent Protobuf");

    Ok(())
}
