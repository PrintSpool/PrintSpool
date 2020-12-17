use std::{
    io,
};

use anyhow::{
    anyhow,
    Result,
    Error,
};

use futures::{
    io::Cursor,
    prelude::*,
};

use async_codec::*;

pub struct ReceiveStreamCodec;

impl Decode for ReceiveStreamCodec {
    type Item = MachineMessage;
    type Error = Error;

    fn decode(&mut self, buf: &mut [u8]) -> (usize, DecodeResult<MachineMessage, Error>) {
        const SIZE_DELIMETER_BYTES: usize = 4;

        // Read the message length
        let message_len = match buf.get(0..SIZE_DELIMETER_BYTES) {
            Some(bytes) => bytes,
            None => return (0, DecodeResult::UnexpectedEnd),
        };

        let message_len = u32::from_le_bytes(message_len) as usize + SIZE_DELIMETER_BYTES;

        // Read the message's content
        let mut message = match buf.get(SIZE_DELIMETER_BYTES..message_len) {
            Some(bytes) => bytes,
            None => return (0, DecodeResult::UnexpectedEnd),
        };

        let message = MachineMessage::decode(&message[..])
            .with_context(|| "machine message decoding failed")?;

        (
            message_len,
            message,
        )
    }
}
