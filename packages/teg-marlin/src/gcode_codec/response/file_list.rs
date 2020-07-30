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

// TRACE teg_marlin::gcode_codec                > RX "Begin file list\n"
// TRACE teg_marlin::gcode_codec                > RX "/47ACB~1.MOD/TEST/TEST-D~1.GCO\n"
// TRACE teg_marlin::gcode_codec                > RX "TEST-D~1.GCO\n"
// TRACE teg_marlin::gcode_codec                > RX "End file list\n"
pub fn file_list() -> FnMut (&'r str) ->  IResult<&'r str, Response> {
    value(
        tuple((
            // "Begin file list\n"
            tag("Begin file list"),
            space0,
            line_ending,
            take_until("\nEnd file list"),
        )),
        Response::Ok(None),
    )
}
