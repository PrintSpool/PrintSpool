use eyre::{
    // eyre,
    Context as _,
    Result,
};
use futures::{SinkExt, StreamExt};
use std::{io, str, cmp};
use tokio_util::codec::{Decoder, Encoder};
use bytes::{BufMut, BytesMut};
use rand::Rng;
use nom_gcode::{
    GCodeLine,
    Mnemonic::{
        // self,
        Miscellaneous as M,
        General as G,
    },
};

pub struct SerialSimulator;

#[derive(Default)]
struct Position {
    pub actual: f32,
    pub target: f32,
}

impl SerialSimulator {
    pub async fn run(serial: tokio_serial::SerialStream) -> Result<()> {
        let (
            mut sender,
            mut reader,
        ) = LineCodec.framed(serial).split();

        let greeting = include_str!("greeting.txt").trim().to_string();
        sender.send(greeting).await?;

        let mut extruder = 22f32;
        let mut extruder_target = 0f32;
        let mut bed = 22f32;
        let mut bed_target = 22f32;

        let mut positions = std::collections::HashMap::new();
        positions.insert('X', Position::default());
        positions.insert('Y', Position::default());
        positions.insert('Z', Position::default());
        positions.insert('E', Position::default());

        let feedrate = 50f32;

        while let Some(line_result) = reader.next().await {
            // let mut rng = rand::thread_rng();

            let line = line_result
                .wrap_err("Failed to read serial simulator")?
                .replace("*", " *");

            if line.is_empty() {
                continue;
            }

            let (_, gcode) = nom_gcode::parse_gcode(&line)?;

            let gcode = if let Some(GCodeLine::GCode(gcode)) = gcode {
                gcode
            } else {
                continue;
            };

            let response = match (&gcode.mnemonic, &gcode.major) {
                // Set Hotend
                (M, 104) => {
                    if let Some((_, Some(target))) = gcode.arguments()
                        .find(|(key, _)| key == &'S')
                    {
                        extruder_target = *target;
                    }

                    while extruder < extruder_target {
                        tokio::time::sleep(
                            std::time::Duration::from_millis(500)
                        )
                            .await;

                        extruder += rand::thread_rng().gen_range(20f32..30f32);
                        bed += rand::thread_rng().gen_range(-2f32..2f32);

                        if (bed as i64) < 0i64 {
                            bed = 0f32
                        }

                        let feedback = format!(
                            "T:{extruder} /0.0 B:{bed} /0.0 B@:0 @:0",
                            extruder = extruder,
                            bed = bed,
                        );
                        sender.send(feedback.to_string()).await?;
                    };

                    "ok".to_string()
                },
                // Set Bed
                (M, 140) => {
                    if let Some((_, Some(target))) = gcode.arguments()
                        .find(|(key, _)| key == &'S')
                    {
                        bed_target = *target;
                    }

                    while bed < bed_target {
                        tokio::time::sleep(
                            std::time::Duration::from_millis(500)
                        )
                            .await;

                        extruder += rand::thread_rng().gen_range(-2f32..2f32);
                        bed += rand::thread_rng().gen_range(5f32..15f32);

                        if (extruder as i64) < 0i64 {
                            extruder = 0f32
                        }

                        let feedback = format!(
                            "T:{extruder} /0.0 B:{bed} /0.0 B@:0 @:0",
                            extruder = extruder,
                            bed = bed,
                        );
                        sender.send(feedback.to_string()).await?;
                    };

                    "ok".to_string()
                },
                (M, 105) => {
                    extruder +=
                        (cmp::max(extruder_target as i64, 22i64) as f32 - extruder).signum()
                        * rand::thread_rng().gen_range(0f32..5f32);

                    bed +=
                        (cmp::max(bed_target as i64, 22i64) as f32 - bed).signum()
                        * rand::thread_rng().gen_range(0f32..5f32);

                    if (extruder as i64) <= 0i64 {
                        extruder = 0f32
                    }

                    if (bed as i64) <= 0i64 {
                        bed = 0f32
                    }

                    format!(
                        "ok T:{extruder} /0.0 B:{bed} /0.0 B@:0 @:0",
                        extruder = extruder,
                        bed = bed,
                    )
                },
                // Move
                | (G, 0)
                | (G, 1) => {
                    for arg in gcode.arguments() {
                        let value = if let Some(value) = arg.1 {
                            value
                        } else {
                            continue
                        };
                        if let Some(p) = positions.get_mut(&arg.0) {
                            p.target = value
                        };
                    }
                    "ok".to_string()
                }
                // Get Position
                (M, 114) => {
                    for (_, p) in positions.iter_mut() {
                        let direction_signum = (p.target - p.actual).signum();
                        p.actual += direction_signum * feedrate;

                        // Handle overshoots
                        if (p.target - p.actual).signum() != direction_signum {
                            p.actual = p.target
                        }
                    }
                    format!(
                        "X:{x} Y:{y} Z:{z} E:{e} Count X: 0.00Y:0.00Z:0.00\nok",
                        x = positions.get(&'X').unwrap().actual,
                        y = positions.get(&'Y').unwrap().actual,
                        z = positions.get(&'Z').unwrap().actual,
                        e = positions.get(&'E').unwrap().actual,
                    )
                }
                _ => "ok".to_string()
            };

            trace!("Simulator responding to {:?} with {:?}", gcode, response);
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
