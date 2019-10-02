extern crate bytes;
extern crate tokio;
extern crate tokio_io;
extern crate tokio_serial;

use std::{io, str};

use tokio::codec::{Decoder, Encoder};

use bytes::{BytesMut, BufMut};

pub mod response;

pub use response::*;

pub struct GCodeCodec;

impl Decoder for GCodeCodec {
    type Item = Response;
    type Error = io::Error;

    fn decode(&mut self, src: &mut BytesMut) -> Result<Option<Self::Item>, Self::Error> {
        let newline = src.as_ref().iter().position(|b| *b == b'\n');
        if let Some(n) = newline {
            // Invalid UTF8 lines are replaced by empty strings and treated as dropped responses.
            let line = str::from_utf8(src.split_to(n + 1).as_ref())
                .unwrap_or_else(|_| "")
                .to_string();

            // println!("RX {:?}", line);
            return Ok(parse_response(line));
        }
        Ok(None)
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


impl Encoder for GCodeCodec {
    type Item = GCodeLine;
    type Error = io::Error;

    fn encode(&mut self, item: Self::Item, dst: &mut BytesMut) -> Result<(), Self::Error> {
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

        // println!("TX  {:?}", line);
        dst.reserve(line.len() + 1);
        dst.put(line);
        Ok(())
    }
}
