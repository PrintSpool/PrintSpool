use async_std::prelude::*;
use async_std::os::unix::net::UnixStream;

use anyhow::{
    // anyhow,
    Result,
    Context as _,
};

use teg_protobufs::{
    MachineMessage,
    Message,
};

pub async fn receive_message(stream: &mut UnixStream) -> Result<MachineMessage> {
    const SIZE_DELIMETER_BYTES: usize = 4;
    // Read the message length
    let mut buf = [0u8; SIZE_DELIMETER_BYTES];
    stream.read_exact(&mut buf).await?;
    let message_len = u32::from_le_bytes(buf);

    // Read the message's content
    let mut buf: Vec<u8> = vec![0; message_len as usize];
    stream.read_exact(&mut buf).await?;

    let message = MachineMessage::decode(&buf[..])
        .with_context(|| "machine message decoding failed")?;

    info!("Received Protobuf (Len: {})", message_len);

    Ok(message)
}
