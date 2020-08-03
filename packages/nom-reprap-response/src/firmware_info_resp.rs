use nom::{
    IResult,
    character::streaming::*,
    bytes::streaming::*,
};
// use nom::branch::*;
use nom::combinator::*;
use nom::sequence::*;
// use nom::multi::*;

use super::{
    Response,
};

// FIRMWARE_NAME:Marlin V1; Sprinter/grbl mashup for gen6 ...
pub fn firmware_info_resp<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    map(
        preceded(
            peek(tag("FIRMWARE_NAME")),
            not_line_ending,
        ),
        |s: &str| Response::Echo(s.to_string())
    )(input)
}
