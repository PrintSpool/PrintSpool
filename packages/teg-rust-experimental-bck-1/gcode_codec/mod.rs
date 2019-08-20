extern crate bytes;
extern crate futures;
extern crate tokio;
extern crate tokio_io;
extern crate tokio_serial;

use std::{io, str};

use tokio_io::codec::{Decoder, Encoder};

use bytes::BytesMut;

pub mod response;

// use futures::{Future, Stream};

pub struct GCodeCodec;

impl Decoder for GCodeCodec {
    type Item = response::Response;
    type Error = io::Error;

    fn decode(&mut self, src: &mut BytesMut) -> Result<Option<Self::Item>, Self::Error> {
        let newline = src.as_ref().iter().position(|b| *b == b'\n');
        if let Some(n) = newline {
            // Invalid UTF8 lines are replaced by empty strings and treated as dropped responses.
            let line = str::from_utf8(src.split_to(n + 1).as_ref())
                .unwrap_or_else(|_| "")
                .to_string();

            return Ok(response::parse_response(line));
        }
        Ok(None)
    }
}

impl Encoder for GCodeCodec {
    type Item = String;
    type Error = io::Error;

    fn encode(&mut self, _item: Self::Item, _dst: &mut BytesMut) -> Result<(), Self::Error> {
        Ok(())
    }
}
