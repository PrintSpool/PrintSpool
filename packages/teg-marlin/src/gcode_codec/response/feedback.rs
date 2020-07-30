use nom::{
    IResult,
    character::{
        is_alphabetic,
        streaming::*,
    },
    bytes::streaming::*,
};
use nom::branch::*;
use nom::combinator::*;
use nom::sequence::*;
use nom::multi::*;

use super::{
    Response,
    SDCardFeedback,
};

#[derive(Clone, Debug, PartialEq)]
pub enum Feedback {
    SDCard(SDCard),
    ActualTemperatures(Vec<(char, f32)>),
    ActualPositions(Vec<(char, f32)>),
}

pub struct SDCard {
    enabled: bool,
    size: Option<i32>,
}

pub fn feedback() -> FnMut (&'r str) ->  IResult<&'r str, Response> {
    alt((
        temperature_feedback(),
        position_feedback(),
    ))
}

pub fn key_value() -> FnMut (&'r str) ->  IResult<&'r str, (std::char, f32)> {
    // 'X:0.00 Y:191.00 Z:159.00 E:0.00 Count X: 0 Y:19196 Z:254400',
    // `X:${position()} Y:${position()} Z:${position()} E:0.00 Count X: 0.00Y:0.00Z:0.00`,
    separated_pair(
        verify(anychar, |c| is_alphabetic(c)),
        pair(
            char(':'),
            space0,
        ),
        f32_str(),
    )
}

pub fn temperature_feedback() -> FnMut (&'r str) ->  IResult<&'r str, Response> {
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
            let temperatures = Feedback::ActualTemperatures(temperatures);
            Response::Feedback(temperatures)
        }
    )
}

pub fn position_feedback() -> FnMut (&'r str) ->  IResult<&'r str, Response> {
    // 'X:0.00 Y:191.00 Z:159.00 E:0.00 Count X: 0 Y:19196 Z:254400',
    // `X:${position()} Y:${position()} Z:${position()} E:0.00 Count X: 0.00Y:0.00Z:0.00`,
    map(
        preceded(
            peek(tag("X:")),
            pair(
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
        |(positions, _counts)|{
            let positions = Feedback::ActualPositions(positions);
            Response::Feedback(positions)
        }
    )
}
