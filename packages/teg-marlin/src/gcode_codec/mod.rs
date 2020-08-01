use anyhow::{
    anyhow,
    // Context as _,
};

use std::str;

use tokio_util::codec::{Decoder, Encoder};

use bytes::{BytesMut, BufMut};

pub mod response;

use response::{
    parse_many_responses,
    Response,
};

pub struct GCodeCodec;

impl Decoder for GCodeCodec {
    type Item = Vec<(String, Response)>;
    type Error = anyhow::Error;

    fn decode(&mut self, src: &mut BytesMut) -> Result<Option<Self::Item>, Self::Error> {
        // Invalid UTF8 lines are replaced by empty strings and treated as dropped responses.
        let src_str = str::from_utf8(src);

        let src_str = if let Ok(src_str) = src_str {
            src_str
        } else {
            return Ok(None)
        };

        match parse_many_responses(src_str) {
            Ok((remaining, responses)) => {
                // Remove the matched bytes from the buffer
                let matched_len = src_str.len() - remaining.len();
                let _ = src.split_to(matched_len);
                Ok(Some(responses))
            }
            Err(nom::Err::Incomplete(_)) => {
                Ok(None)
            },
            Err(e) => {
                Err(anyhow!("Invalid Response ({:?}) for input: {}", e, src_str))
            }
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct GCodeLine {
    pub gcode: String,
    pub line_number: Option<u32>,
    pub checksum: bool,
}

fn add_checksum(line: String) -> String {
  let mut sum = 0;
  for byte in line.as_bytes() {
    sum ^= byte;
  };
  sum &= 0xff;

  format!("{:}*{:}\n", line, sum)
}


impl Encoder<GCodeLine> for GCodeCodec {
    type Error = anyhow::Error;

    fn encode(&mut self, item: GCodeLine, dst: &mut BytesMut) -> Result<(), Self::Error> {
        let GCodeLine { gcode, line_number, checksum } = item;

        let line = if let Some(line_number) = line_number {
            format!("N{:} {:}", line_number, gcode)
        } else {
            gcode
        };

        let line = if checksum {
            add_checksum(line)
        } else {
            line + "\n"
        };

        trace!("TX {:?}", line);

        let line = line.as_bytes();

        dst.reserve(line.len() + 1);
        dst.put(line);
        Ok(())
    }
}
