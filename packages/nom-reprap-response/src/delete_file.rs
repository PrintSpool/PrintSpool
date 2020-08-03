use nom::{
    IResult,
    character::streaming::*,
    bytes::streaming::*,
};
use nom::combinator::*;
use nom::sequence::*;

use super::{
    Response,
};

// TX "N109 M30 /teg.gcode*37\n"
// RX "Deletion failed, File: teg.gcod.\n"
pub fn delete_file_resp<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    map(
        recognize(pair(
            tag("Deletion failed, File:"),
            not_line_ending,
        )),
        |s: &'r str| Response::Error(s.to_string()),
    )(input)
}
