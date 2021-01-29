// SaltyRTC Chunking Protocol
// See https://github.com/saltyrtc/saltyrtc-meta/blob/master/Chunking.md

use std::collections::HashMap;
use eyre::{
    Result,
    // Context as _,
    eyre,
};
use futures_util::{
    future,
    stream::{
        self,
        Stream,
        StreamExt,
        TryStreamExt,
    },
};
use bytes::Buf;

use crate::iter::IdentifyFirstLast;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ReliabilityMode {
    ReliableOrdered,
    UnreliableUnordered,
}

impl ReliabilityMode {
    pub fn bit_field_value(&self, end_of_message: bool) -> u8 {
        let end_of_message_bit = end_of_message as u8;
        use ReliabilityMode::*;

        let bit_field = match self {
            ReliableOrdered => {
                0b00000110
            }
            UnreliableUnordered => {
                0b00000000
            }
        };

        bit_field & end_of_message_bit
    }

    /// The number of bytes in a header in this mode
    pub fn header_bytes_size(&self) -> usize {
        use ReliabilityMode::*;
        match self {
            ReliableOrdered => 1,
            UnreliableUnordered => 9,
        }
    }
}

#[derive(new, Debug, Clone)]
struct PartialMessage {
    /// Chunk serial numbers and payloads
    #[new(default)]
    chunks: Vec<(u32, Vec<u8>)>,
    #[new(default)]
    final_serial_number: Option<u32>,
}

#[derive(new, Debug, Clone)]
pub struct ChunkDecoder {
    pub mode: ReliabilityMode,
    #[new(default)]
    partial_messages: HashMap<u32, PartialMessage>,
}

impl ChunkDecoder {
    pub fn decode_stream<S>(self, stream: S) -> impl Stream<Item = Result<Vec<u8>>>
    where
        S: Stream<Item = Vec<u8>>,
    {
        stream
            .scan(self, |chunk_decoder, chunk| {
                let msg = chunk_decoder.decode_single_message(chunk);
                future::ready(Some(msg))
            })
            .try_filter_map(|msg| {
                future::ok(msg)
            })
    }

    fn decode_single_message(&mut self, buf: Vec<u8>) -> Result<Option<Vec<u8>>> {
        let reliable_mode = self.mode == ReliabilityMode::ReliableOrdered;
        let mut buf = buf.as_slice();

        // Validate the message length
        if buf.len() < self.mode.header_bytes_size() + 1 {
            Err(eyre!(
                "Incomplete SaltyRTC Chunk received (size: {})",
                buf.len(),
            ))?
        }

        // Options Bit Field
        let mode_bit_field = self.mode.bit_field_value(false);
        let actual_bit_field = buf.get_u8();

        // XORing out the reliability mode
        let end_of_message_bit = actual_bit_field ^ mode_bit_field;
        let end_of_message = end_of_message_bit == 1;

        // The remaining bit field after XORing should equal 0 or 1 for the end of message bit
        if end_of_message_bit > 1 {
            Err(eyre!(
                "Invalid bit field received for SaltyRTC Chunk: {}",
                actual_bit_field,
            ))?
        }

        // Recording the msg id and serial number
        let mut msg_id = 0;
        let mut serial = 0;

        if !reliable_mode {
            msg_id = buf.get_u32();
            serial = buf.get_u32();
        }

        // Getting the payload of the chunk
        let payload = buf[buf.len() - buf.remaining()..].to_vec();

        // Updating the partial message
        let partial_message = self.partial_messages
            .entry(msg_id)
            .or_insert_with(|| {
                PartialMessage::new()
            });

        let is_duplicate = !reliable_mode && partial_message.chunks
            .iter()
            .any(|(i, _)| i == &serial);

        if is_duplicate {
            return Ok(None);
        };

        partial_message.chunks.push((serial, payload));

        if end_of_message {
            if reliable_mode {
               return self.complete_message(msg_id);
            } else {
                partial_message.final_serial_number = Some(serial);
            };
        };

        if !reliable_mode {
            let is_complete = partial_message.final_serial_number
                .map(|final_serial_number| {
                    partial_message.chunks.len() == final_serial_number as usize + 1
                })
                .unwrap_or(false);

            if is_complete {
                partial_message.chunks
                    .sort_by_key(|(serial_number, _)| *serial_number);

                return self.complete_message(msg_id);
            }
        }

        Ok(None)
    }

    /// This function assumes the chunks are already sorted by their serial number
    fn complete_message(&mut self, msg_id: u32) -> Result<Option<Vec<u8>>> {
        let partial_message = self.partial_messages
            .remove(&msg_id)
            .ok_or_else(|| eyre!("SaltyRTC parial message not found"))?;

        let msg = partial_message.chunks
            .into_iter()
            .flat_map(|(_, chunk)| chunk)
            .collect();

        return Ok(Some(msg));
    }
}

#[derive(new, Debug, Clone)]
pub struct ChunkEncoder {
    pub mode: ReliabilityMode,
    #[new(default)]
    next_messsage_id: u32,
}

impl ChunkEncoder {
    pub fn encode_stream<S>(self, stream: S) -> impl Stream<Item = Vec<u8>>
    where
        S: Stream<Item = Vec<u8>>,
    {
        stream
            .scan(self, |chunk_encoder, msg| {
                let chunks = chunk_encoder.encode_single_message(msg);
                let chunks = stream::iter(chunks);
                future::ready(Some(chunks))
            })
            .flatten()
    }

    fn encode_single_message(&mut self, msg: Vec<u8>) -> Vec<Vec<u8>> {
        let chunk_payload_size = u16::MAX as usize - self.mode.header_bytes_size();

        let msg_id = self.next_messsage_id.to_le_bytes();
        self.next_messsage_id += 1;

        let chunks: Vec<Vec<u8>> = msg
            .chunks(chunk_payload_size)
            .enumerate()
            .identify_first_last()
            .map(|(_first, last, (chunk_serial, chunk_payload))| {
                // Option Bitfield
                let options_bit_field = self.mode.bit_field_value(last);
                let mut chunk = vec![options_bit_field];

                // Long Headers
                if let ReliabilityMode::UnreliableUnordered = self.mode {
                    chunk.extend_from_slice(&msg_id);
                    chunk.extend_from_slice(&(chunk_serial as u32).to_le_bytes());
                };

                // Payload
                chunk.extend_from_slice(&chunk_payload);
                chunk
            })
            .collect();

        // info!("Encoded SaltyRTC Chunks (Len: {})", chunks.len());

        chunks
    }
}
