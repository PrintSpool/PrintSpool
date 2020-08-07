use nom::{
    IResult,
    character::streaming::*,
    bytes::streaming::*,
};
use nom::branch::*;
use nom::combinator::*;
use nom::sequence::*;
use nom::multi::*;

use super::{
    Response,
    f32_str,
};

#[derive(Clone, Debug, PartialEq)]
pub enum Feedback {
    SDCard(SDCard),
    ActualTemperatures(Vec<(String, f32)>),
    Positions(Positions),
    StartSDWrite(StartSDWrite),
    SDWriteComplete,
    SDPrintComplete,
}

#[derive(Clone, Debug, PartialEq)]
pub struct Positions {
    pub target_positions: Option<Vec<(String, f32)>>,
    pub actual_positions: Vec<(String, f32)>,
}

#[derive(Clone, Debug, PartialEq)]
pub struct StartSDWrite {
    pub filename: String,
}

#[derive(Clone, Debug, PartialEq)]
pub struct SDCard {
    pub enabled: bool,
    pub size: Option<u32>,
}

pub fn feedback_resp<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    map(
        feedback,
        |feedback| Response::Feedback(feedback),
    )(input)
}

pub fn feedback<'r>(input: &'r str) ->  IResult<&'r str, Feedback> {
    alt((
        temperature_feedback,
        position_feedback,
    ))(input)
}

pub fn key_value<'r>(input: &'r str) -> IResult<&'r str, (String, Option<f32>)> {
    // T:25.0 /0.0 B:25.0 /0.0 T0:25.0 /0.0 @:0 B@:0
    // X:0.00 Y:191.00 Z:159.00 E:0.00 Count X: 0 Y:19196 Z:254400
    // X:${position()} Y:${position()} Z:${position()} E:0.00 Count X: 0.00Y:0.00Z:0.00
    separated_pair(
        map(
            recognize(many1(
                verify(anychar, |c| c.is_ascii_alphanumeric() || c == &'@'),
            )),
            |address: &str| address.to_ascii_lowercase()
        ),
        pair(
            char(':'),
            space0,
        ),
        alt((
            value(None, char('?')),
            map(f32_str(), |f| Some(f)),
        ))
    )(input)
}

pub fn temperature_feedback<'r>(input: &'r str) ->  IResult<&'r str, Feedback> {
    // ok T:25.0 /0.0 B:25.0 /0.0 T0:25.0 /0.0 @:0 B@:0
    // T:${extruder} /0.0 B:${bed} /0.0 B@:0 @:0
    map(
        preceded(
            peek(tag("T:")),
            separated_list1(
                pair(
                    space1,
                    opt(tuple((
                        char('/'),
                        f32_str(),
                        space1,
                    ))),
                ),
                key_value,
            ),
        ),
        |temperatures| {
            let temperatures = temperatures
                .into_iter()
                .filter_map(|(address, v)| {
                    // Skip "@" and "e" values. I have no idea what they are for but Marlin sends 
                    // them.
                    if address.contains('@') || address == "e" {
                        return None
                    };

                    let address = if &address[..] == "t" {
                        "e0".to_string()
                    } else if address.starts_with('t') {
                        address.replace("t", "e")
                    }else {
                        address
                    };

                    v.map(|v| (address, v))
                })
                .collect();
            Feedback::ActualTemperatures(temperatures)
        }
    )(input)
}

pub fn position_feedback<'r>(input: &'r str) ->  IResult<&'r str, Feedback> {
    //           target positions                actual positions
    // |-------------------------------|     |---------------------|
    // 'X:0.00 Y:191.00 Z:159.00 E:0.00 Count X: 0 Y:19196 Z:254400',
    // `X:${position()} Y:${position()} Z:${position()} E:0.00 Count X: 0.00Y:0.00Z:0.00`,
    map(
        preceded(
            peek(tag("X:")),
            pair(
                many1(preceded(
                    space0,
                    key_value,
                )),
                opt(preceded(
                    tuple((
                        space1,
                        tag_no_case("Count"),
                        space1,
                    )),
                    many0(terminated(
                        key_value,
                        space0,
                    )),
                )),
            ),
        ),
        |(p1, p2)| {
            if let Some(p2) = p2 {
                Feedback::Positions(Positions {
                    target_positions: Some(normalize_positions(p1)),
                    actual_positions: normalize_positions(p2),
                })
            } else {
                Feedback::Positions(Positions {
                    target_positions: None,
                    actual_positions: normalize_positions(p1),
                })
            }
        }
    )(input)
}

fn normalize_positions(positions: Vec<(String, Option<f32>)>) -> Vec<(String, f32)> {
    positions
        .into_iter()
        .filter_map(|(address, v)| {
            let address = if &address[..] == "e" {
                "e0".to_string()
            } else if address.starts_with('t') {
                address.replace("t", "e")
            }else {
                address
            };

            v.map(|v| (address, v))
        })
        .collect()
}
