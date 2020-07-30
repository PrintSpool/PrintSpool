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

pub fn echo() -> FnMut (&'r str) ->  IResult<&'r str, Response> {
    preceded(
        pair(
            tag_no_case("echo:"),
            space0,
        ),
        alt(
            m21_sd_card_ok(),
            map(
                not_line_ending,
                |s| Response::Echo(s.to_string()),
            ),
        ),
    )
}

// TRACE teg_marlin::gcode_codec                > TX  "N63 M21*37\n"
// TRACE teg_marlin::gcode_codec                > RX "echo:SD card ok\n"
// TRACE teg_marlin::gcode_codec                > RX "Init power off infomation.\n"
// TRACE teg_marlin::gcode_codec                > RX "size: \n"
// 123
fn m21_sd_card_ok() -> FnMut (&'r str) ->  IResult<&'r str, Response> {
    map_res(
        prefix(
            tuple((
                tag("SD card ok"),
                space0,
                line_ending,
                take_until("\nsize:"),
                space0,
                line_ending,
            )),
            digit1,
        ),
        |size| {
            let sd_card = SDCard {
                enabled: true,
                size: Some(size.parse()),
            };
            Response::Feedback(sd_card)
        },
    )
}
