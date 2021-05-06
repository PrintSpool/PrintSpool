// SaltyRTC Chunking Protocol
// See https://github.com/saltyrtc/saltyrtc-meta/blob/master/Chunking.md

use std::{collections::{BTreeMap, BTreeSet}, time::Duration};
use eyre::{
    Result,
    // Context as _,
    eyre,
};
use futures_util::{Future, future, stream::{
        self,
        Stream,
        StreamExt,
        TryStreamExt,
    }};
use bytes::Buf;

use crate::iter::IdentifyFirstLast;

// Enables timestampping and logging of the timing of each message. This causes slow down so it
// is disabled by default.
static PROFILE_CHUNK_DECODE: bool = true;
static MULTIPART_FILE_FLAG: u8 = 0b00001000;
static END_OF_MESSAGE_FLAG: u8 = 0b00000001;
static MODE_MASK: u8 = 0b00000110;
// static MULTIPART_FILE_CHUNK_SIZE: u64 = u16::MAX as u64;

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

        bit_field | end_of_message_bit
    }

    /// The number of bytes in a header in this mode
    pub fn header_bytes_size(&self, multipart_file: bool) -> usize {
        use ReliabilityMode::*;
        let size = match self {
            ReliableOrdered => 1,
            UnreliableUnordered => 9,
        };
        if multipart_file {
            // multipart files append an additional 32 bit (4 byte) file ID
            size + 4
        } else {
            size
        }
    }
}

/// A section contains chunks mapped by their serial
type Section = BTreeMap<u32, Vec<u8>>;

#[derive(new, Debug)]
struct PartialMessage {
    /// Chunk serial numbers and payloads
    #[new(default)]
    chunks: BTreeSet<u32>,
    /// Each section is keyed by it's first serial
    #[new(default)]
    sections: BTreeMap<u32, Section>,
    #[new(default)]
    final_serial_number: Option<u32>,
    started_at: Option<std::time::Instant>,
}

trait DecodeFuture: Future<Output = Result<Option<Vec<u8>>>> + Sized {}

// #[derive(new)]
// #[pin_project]
// pub struct ChunkDecoder<S> {
#[derive(new)]
pub struct ChunkDecoder {
    pub mode: ReliabilityMode,
    // #[pin]
    // stream: S,
    // #[pin]
    // decode_future: Option<Box<dyn DecodeFuture>>,
    #[new(default)]
    partial_messages: BTreeMap<u32, PartialMessage>,
}

pub struct InMemoryMessage {
    pub payload: Vec<u8>,
    pub files: Vec<Vec<u8>>,
}

impl ChunkDecoder {
    pub fn decode_stream<S>(self, stream: S) -> impl Stream<Item = Result<InMemoryMessage>>
    where
        S: Stream<Item = Vec<u8>>,
    {
        stream
            .scan(self, |chunk_decoder, chunk| {
                let msg = chunk_decoder
                    .decode_single_message(chunk);
                return future::ready(Some(msg))
            })
            .try_filter_map(|msg| {
                future::ok(msg)
            })
    }

    fn decode_single_message(&mut self, buf: Vec<u8>) -> Result<Option<InMemoryMessage>> {
        let reliable_mode = self.mode == ReliabilityMode::ReliableOrdered;
        let mut buf = buf.as_slice();

        // Validate the message contains at least 1 header bit
        if buf.len() < 1 {
            Err(eyre!(
                "Incomplete SaltyRTC Chunk received (size: {})",
                buf.len(),
            ))?
        }

        // Options Bit Field
        let mode_bit_field = self.mode.bit_field_value(false);
        let actual_bit_field = buf.get_u8();

        if actual_bit_field & MODE_MASK != mode_bit_field {
            Err(eyre!(
                "Invalid bit field received for SaltyRTC Chunk in {mode:?}: {bit_field}",
                mode = self.mode,
                bit_field = actual_bit_field,
            ))?
        }

        // Get the multipart file flag
        let multipart_file = actual_bit_field & MULTIPART_FILE_FLAG != 0;

        // Get the end of message flag
        let end_of_message = actual_bit_field & END_OF_MESSAGE_FLAG != 0;

        // Validate the message length based on the header
        if buf.len() < self.mode.header_bytes_size(multipart_file) + 1 {
            Err(eyre!(
                "Incomplete SaltyRTC Chunk received (size: {})",
                buf.len(),
            ))?
        }

        // Recording the msg id and serial number
        let mut msg_id = 0;
        let mut serial = 0;

        if !reliable_mode {
            msg_id = buf.get_u32();
            serial = buf.get_u32();
        }

        let section_start = if multipart_file {
            buf.get_u32()
        } else {
            0
        };

        // if multipart_file {
        //     info!(
        //         "ID {} SERIAL {} IS A MULTIPART FILE STARTING AT {}",
        //         msg_id,
        //         serial,
        //         section_start
        //     );
        // } else {
        //     info!("NORMAL. ID {} SERIAL {}", msg_id, serial);
        // };

        // Getting the payload of the chunk
        let payload = buf[buf.len() - buf.remaining()..].to_vec();

        // Updating the partial message
        let partial_message = self.partial_messages
            .entry(msg_id)
            .or_insert_with(|| {
                let started_at = if PROFILE_CHUNK_DECODE {
                    Some(std::time::Instant::now())
                } else {
                    None
                };

                PartialMessage::new(started_at)
            });

        let is_duplicate = !reliable_mode && partial_message.chunks.contains(&serial);

        if is_duplicate {
            return Ok(None);
        };

        // mark the chunk as received
        partial_message.chunks.insert(serial);

        // add the chunk to the section (either the message's content or the appropriate file)
        let section = partial_message.sections
            .entry(section_start)
            .or_default();

        section.insert(serial, payload);

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
                return self.complete_message(msg_id);
            }
        }

        Ok(None)
    }

    /// This function assumes the chunks are already sorted by their serial number
    fn complete_message(&mut self, msg_id: u32) -> Result<Option<InMemoryMessage>> {
        let mut partial_message = self.partial_messages
            .remove(&msg_id)
            .ok_or_else(|| eyre!("SaltyRTC parial message not found"))?;

        let started_at =  partial_message.started_at.take();
        let chunks_len = partial_message.chunks.len();

        let mut sections = partial_message.sections
            .into_iter()
            .map(|(_, section)| {
                section
                    .into_iter()
                    .flat_map(|(_, chunk)| chunk)
                    .collect()
            });

        // The first section is always the message
        let payload = sections.next().unwrap();
        // The following sections are the file uploads
        let files = sections.collect();

        if let Some(started_at) = started_at {
            let elapsed = started_at.elapsed();
            if elapsed >= Duration::from_millis(100) {
                info!("Decoded {} chunks in {:?}", chunks_len, elapsed);
            }
        }

        return Ok(Some(InMemoryMessage {
            payload,
            files,
        }));
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
        // currently sending files from Rust is not supported (only receiving)
        let header_size = self.mode.header_bytes_size(false);
        let chunk_payload_size = u16::MAX as usize - header_size;

        let msg_id = self.next_messsage_id.to_be_bytes();
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
                    chunk.extend_from_slice(&(chunk_serial as u32).to_be_bytes());
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
