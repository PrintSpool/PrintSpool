use eyre::{
    eyre,
    Context as _,
    Result,
};
use futures::{SinkExt, StreamExt};
use std::{io, str};
use tokio_util::codec::{Decoder, Encoder};
use bytes::{BufMut, BytesMut};
use rand::Rng;

pub struct SerialSimulator;

impl SerialSimulator {
    pub async fn run(serial: tokio_serial::Serial) -> Result<()> {
        let (
            mut sender,
            mut reader,
        ) = LineCodec.framed(serial).split();

        let greeting = include_str!("greeting.txt").trim().to_string();
        sender.send(greeting).await?;

        while let Some(line_result) = reader.next().await {
            // let mut rng = rand::thread_rng();

            let line = line_result
                .wrap_err("Failed to read serial simulator")?
                .replace("*", " *");

            if line.is_empty() {
                continue;
            }

            let mut words = line
                .split_ascii_whitespace()
                .skip(if line.starts_with('N') { 1 } else { 0 });

            let gcode = words.next()
                .ok_or_else(|| eyre!("unable to parse line: {:?}", line))?;

            let response = match gcode {
                "M105" => format!(
                    "ok T:{extruder} /0.0 B:{bed} /0.0 B@:0 @:0",
                    extruder = rand::thread_rng().gen_range(70..90),
                    bed = rand::thread_rng().gen_range(20..30),
                ),
                "M114" => format!(
                    "X:{x} Y:{y} Z:{z} E:0.00 Count X: 0.00Y:0.00Z:0.00",
                    x = 25.0,
                    y = 50.0,
                    z = 100.0,
                ),
                _ => "Ok".to_string()
            };

            info!("Simulator responding to {:?} with {:?}", gcode, response);
            sender.send(response).await?;
        }
        Ok(())
    }
}

struct LineCodec;

impl Decoder for LineCodec {
    type Item = String;
    type Error = io::Error;

    fn decode(&mut self, src: &mut BytesMut) -> Result<Option<Self::Item>, Self::Error> {
        let newline = src.as_ref().iter().position(|b| *b == b'\n');
        if let Some(n) = newline {
            let line = src.split_to(n + 1);
            return match str::from_utf8(line.as_ref()) {
                Ok(s) => Ok(Some(s.trim().to_string())),
                Err(_) => Err(io::Error::new(io::ErrorKind::Other, "Invalid String")),
            };
        }
        Ok(None)
    }
}

impl Encoder<String> for LineCodec {
    type Error = io::Error;

    fn encode(&mut self, item: String, dst: &mut BytesMut) -> Result<(), Self::Error> {
        let item = format!("{}\n", item);
        let line = item.as_bytes();

        dst.reserve(line.len() + 1);
        dst.put(line);

        Ok(())
    }
}
