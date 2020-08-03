use nom::{
    IResult,
    character::streaming::*,
    bytes::streaming::*,
};
use nom::branch::*;
use nom::combinator::*;
use nom::sequence::*;
// use nom::multi::*;

use super::{
    Response,
    SDCard,
    Feedback,
    StartSDStreaming,
    u32_str,
};

pub fn echo<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    preceded(
        pair(
            tag_no_case("echo:"),
            space0,
        ),
        alt((
            m21_sd_card_ok,
            m23_m28_fresh_file,
            normal_echo_content,
        )),
    )(input)
}

fn normal_echo_content<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    map(
        not_line_ending,
        |s: &str| Response::Echo(s.to_string()),
    )(input)
}

// TX "N63 M21*37\n"
// RX "echo:SD card ok\n"
// RX "Init power off infomation.\n"
// RX "size: \n"
// 123
fn m21_sd_card_ok<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    map(
        preceded(
            tuple((
                tag("SD card ok"),
                space0,
                line_ending,
                take_until("\nsize:"),
                space0,
                line_ending,
            )),
            u32_str(),
        ),
        |size: u32| {
            let sd_card = SDCard {
                enabled: true,
                size: Some(size),
            };
            Response::Ok(Some(Feedback::SDCard(sd_card)))
        },
    )(input)
}

// TX "N389 M28 file.txt *75\n"
// RX "echo:Now fresh file: file.txt\n"
// RX "Writing to file: file.txt\n"
// OR
// TX "N125 M28 teg.gcode*13\n"
// RX "echo:Now fresh file: teg.gcod\n"
// RX "open failed, File: teg.gcod.\n"
fn m23_m28_fresh_file<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    preceded(
        tuple((
            tag_no_case("Now fresh file:"),
            not_line_ending,
            line_ending,
        )),
        alt((
            // RX "Writing to file: file.txt\n"
            map(
                preceded(
                    pair(
                        tag_no_case("Writing to file:"),
                        space0,
                    ),
                    not_line_ending,
                ),
                |filename: &str| {
                    let start_streaming = Feedback::StartSDStreaming(StartSDStreaming {
                        filename: filename.to_string(),
                    });

                    Response::Ok(Some(start_streaming))
                },
            ),
            // RX "File opened: file.tx Size: 17\n"
            // RX "File selected\n"
            map(
                recognize(tuple((
                    tag("File opened:"),
                    not_line_ending,
                    line_ending,
                    tag("File selected"),
                ))),
                |s: &str| Response::Debug(s.to_string())
            ),
            // RX "open failed, File: teg.gcod.\n"
            map(
                preceded(
                    tag_no_case("open failed, File:"),
                    not_line_ending,
                ),
                |_| {
                    Response::Error("\
                        Failed to open sd card file. \
                        Check that SD card is inserted and enabled in firmware.\
                    ".to_string())
                },
            ),
        )),
    )(input)
}
