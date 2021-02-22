// use eyre::{
//     eyre,
//     // Context as _,
// };

use std::str;

use tokio_util::codec::{Decoder, Encoder};

use bytes::{BytesMut, BufMut};

use nom_reprap_response::{
    parse_response,
    Response,
    Feedback,
};

pub struct GCodeCodec;

impl Decoder for GCodeCodec {
    type Item = Vec<(String, Response)>;
    type Error = eyre::Error;

    fn decode(&mut self, src: &mut BytesMut) -> Result<Option<Self::Item>, Self::Error> {
        // Invalid UTF8 lines are replaced by empty strings and treated as dropped responses.
        let src_str = str::from_utf8(src);

        let src_str = if let Ok(src_str) = src_str {
            src_str
        } else {
            return Ok(None)
        };

        let mut matched_bytes = 0;
        let responses = std::iter::repeat(None)
            .scan(src_str, |acc, _: Option<bool>| {
                match parse_response(acc) {
                    Ok((remaining, response)) => {
                        matched_bytes += response.0.len();

                        *acc = remaining;
                        Some(response)
                    }
                    Err(nom::Err::Incomplete(_)) => {
                        None
                    },
                    | Err(nom::Err::Failure(err))
                    | Err(nom::Err::Error(err)) => {
                        let warning = format!(
                            "Error parsing serial response: {:?}",
                            err,
                        );

                        // Skip the erroneous line
                        if let Some(n) = acc.find('\n') {
                            matched_bytes += n + 1;

                            let content = acc[..n].to_string();
                            *acc = &acc[n + 1..];

                            warn!("{} in line {:?}", warning, content);

                            Some((content, Response::Unknown))
                        } else {
                            warn!("{}", warning);

                            None
                        }
                    }
                }
            })
            .inspect(|(line, response)| {
                // Logging
                let span = match response {
                    | Response::Ok(Some(Feedback::ActualTemperatures(_)))
                    | Response::Feedback(Feedback::Positions(_)) => {
                        span!(tracing::Level::TRACE, "feedback")
                    },
                    _ => {
                        span!(tracing::Level::TRACE, "print")
                    }
                };
                let _enter = span.enter();

                trace!("RX {:?}", line);
            })
            .collect::<Vec<_>>();

        // Remove the matched bytes from the buffer
        let _ = src.split_to(matched_bytes);

        if responses.len() == 0 {
            Ok(None)
        } else {
            Ok(Some(responses))
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
    type Error = eyre::Error;

    fn encode(&mut self, item: GCodeLine, dst: &mut BytesMut) -> Result<(), Self::Error> {
        let GCodeLine { gcode, line_number, checksum } = item;

        let span = if gcode.starts_with("M105") || gcode.starts_with("M114") {
            span!(tracing::Level::TRACE, "feedback")
        } else {
            span!(tracing::Level::TRACE, "print")
        };
        let _enter = span.enter();

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
