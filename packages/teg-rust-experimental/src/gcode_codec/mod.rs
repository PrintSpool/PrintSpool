extern crate bytes;
extern crate futures;
extern crate tokio;
extern crate tokio_io;
extern crate tokio_serial;

use std::{io, str};

use tokio_io::codec::{Decoder, Encoder};

use bytes::BytesMut;

mod response;

// use futures::{Future, Stream};

pub struct GCodeCodec;

impl Decoder for GCodeCodec {
    type Item = response::Response;
    type Error = io::Error;

    fn decode(&mut self, src: &mut BytesMut) -> Result<Option<Self::Item>, Self::Error> {
        let newline = src.as_ref().iter().position(|b| *b == b'\n');
        if let Some(n) = newline {
            let line = src.split_to(n + 1);
            return response::parse_response(line.as_ref());
            // return match str::from_utf8(line.as_ref()) {
            //     Ok(s) => {
            //         let res = response::parse_response(s.to_string())?;
            //         Ok(Some(res))
            //     },
            //     Err(_) => Err(io::Error::new(io::ErrorKind::Other, "Invalid String")),
            // };
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
