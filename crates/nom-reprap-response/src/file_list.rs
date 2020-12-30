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

// TX "M20"
// RX "Begin file list\n"
// RX "/47ACB~1.MOD/TEST/TEST-D~1.GCO\n"
// RX "TEST-D~1.GCO\n"
// RX "End file list\n"
pub fn file_list<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    let end_tag = "\nEnd file list";

    value(
        Response::Ok(None),
        tuple((
            tag("Begin file list"),
            space0,
            line_ending,
            take_until(end_tag),
            tag(end_tag),
        )),
    )(input)
}
