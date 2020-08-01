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
    ActualTemperatures(Vec<(char, f32)>),
    ActualPositions(Vec<(char, f32)>),
    StartSDStreaming(StartSDStreaming),
    StopSDStreaming,
}

#[derive(Clone, Debug, PartialEq)]
pub struct StartSDStreaming {
    pub filename: String,
}

#[derive(Clone, Debug, PartialEq)]
pub struct SDCard {
    pub enabled: bool,
    pub size: Option<u32>,
}

pub fn feedback_resp<'r>() -> impl FnMut (&'r str) ->  IResult<&'r str, Response> {
    map(
        feedback(),
        |feedback| Response::Feedback(feedback),
    )
}

pub fn feedback<'r>() -> impl FnMut (&'r str) ->  IResult<&'r str, Feedback> {
    alt((
        temperature_feedback(),
        position_feedback(),
    ))
}

pub fn key_value<'r>() -> impl FnMut (&'r str) ->  IResult<&'r str, (char, f32)> {
    // 'X:0.00 Y:191.00 Z:159.00 E:0.00 Count X: 0 Y:19196 Z:254400',
    // `X:${position()} Y:${position()} Z:${position()} E:0.00 Count X: 0.00Y:0.00Z:0.00`,
    separated_pair(
        verify(anychar, |c| c.is_alphabetic()),
        pair(
            char(':'),
            space0,
        ),
        f32_str(),
    )
}

pub fn temperature_feedback<'r>() -> impl FnMut (&'r str) ->  IResult<&'r str, Feedback> {
    // ok T:${extruder} /0.0 B:${bed} /0.0 B@:0 @:0
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
                key_value(),
            ),
        ),
        |temperatures| {
           Feedback::ActualTemperatures(temperatures)
        }
    )
}

pub fn position_feedback<'r>() -> impl FnMut (&'r str) ->  IResult<&'r str, Feedback> {
    // 'X:0.00 Y:191.00 Z:159.00 E:0.00 Count X: 0 Y:19196 Z:254400',
    // `X:${position()} Y:${position()} Z:${position()} E:0.00 Count X: 0.00Y:0.00Z:0.00`,
    map(
        preceded(
            peek(tag("X:")),
            terminated(
                separated_list1(
                    space1,
                    key_value(),
                ),
                opt(tuple((
                    tag_no_case("Count"),
                    space1,
                    not_line_ending,
                ))),
            ),
        ),
        |positions| {
            Feedback::ActualPositions(positions)
        }
    )
}
