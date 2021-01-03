use std::convert::TryInto;
use anyhow::{
    Error,
    Context as _,
    anyhow,
};
use async_codec::*;
use bytes::BufMut;


use teg_protobufs::{CombinatorMessage, MachineMessage, Message};

#[derive(Debug, Clone)]
pub struct MachineCodec;

impl Decode for MachineCodec {
    type Item = MachineMessage;
    type Error = Error;

    fn decode(&mut self, buf: &mut [u8]) -> (usize, DecodeResult<MachineMessage, Error>) {
        const SIZE_DELIMETER_BYTES: usize = 4;

        // Read the message length
        let message_len = match buf.get(0..SIZE_DELIMETER_BYTES) {
            Some(bytes) => bytes.try_into().expect("message_len is explicitly 4 bytes"),
            None => return (0, DecodeResult::UnexpectedEnd),
        };

        let message_len = u32::from_le_bytes(message_len) as usize + SIZE_DELIMETER_BYTES;

        // Read the message's content
        let message = match buf.get(SIZE_DELIMETER_BYTES..message_len) {
            Some(bytes) => bytes,
            None => return (0, DecodeResult::UnexpectedEnd),
        };

        let message = MachineMessage::decode(&message[..])
            .with_context(|| "machine message decoding failed");

        (
            message_len,
            message.into(),
        )
    }
}

impl Encode for MachineCodec {
    type Item = CombinatorMessage;
    type Error = Error;

    fn encode(&mut self, item: &CombinatorMessage, mut buf: &mut [u8]) -> EncodeResult<Error> {
        const SIZE_DELIMETER_BYTES: usize = 4;
        let needed = item.encoded_len() + SIZE_DELIMETER_BYTES;
        if buf.len() < needed {
            return EncodeResult::Overflow(needed);
        }

        // let mut item_bytes = Vec::with_capacity(
        //     item.encoded_len() + SIZE_DELIMETER_BYTES,
        // );
        buf.put_u32_le(item.encoded_len() as u32);

        if let Err(err) = item.encode(&mut buf) {
            return EncodeResult::Err(anyhow!("combinator message encoding failed: {:?}", err));
        }

        // buf[..needed - 1].copy_from_slice(&item_bytes[..]);
        info!("Sending Protobuf (Len: {} {})", buf.len(), buf.len() as u32);

        Ok(needed).into()
    }
}
