#![type_length_limit="1073741824"]

#[macro_use] extern crate log;

use nom::{
    IResult,
    character::streaming::*,
    bytes::streaming::*,
};
use nom::branch::*;
use nom::combinator::*;
use nom::sequence::*;
use nom::multi::*;

mod delete_file;
pub use delete_file::delete_file_resp;

mod echo;
pub use echo::echo;

mod feedback;
pub use feedback::*;

mod file_list;
pub use file_list::file_list;

mod firmware_info_resp;
pub use firmware_info_resp::firmware_info_resp;

pub mod sd_responses;

#[cfg(test)]
mod tests;

#[derive(Clone, Debug, PartialEq)]
pub enum Response {
    Greeting,
    Ok(Option<Feedback>),
    Feedback(Feedback),
    Debug(String),
    Echo(String),
    Error(String),
    Warning(String),
    Resend(Resend),
    Unknown,
}

#[derive(Clone, Debug, PartialEq)]
pub struct Resend {
    pub line_number: u32,
}

pub fn parse_response<'r>(src: &'r str) -> IResult<&'r str, (String, Response)> {
    let mut parser = preceded(
        // Quickly verify that the string contains a new line
        peek(pair(
            opt(not_line_ending),
            line_ending,
        )),
        // Parse the response
        response(),
    );

    let (remaining, response) = parser(src)?;

    let matched_len = src.len() - remaining.len();
    let matched_string = src[..matched_len].to_string();
    
    Ok((remaining, (matched_string, response)))
}

pub fn response<'r>() -> impl FnMut(&'r str) -> IResult<&'r str, Response> {
    terminated(
        alt((
            greeting,
            debug,
            echo,
            ok_resp,
            err_resp,
            resend,
            feedback_resp,
            firmware_info_resp,
            sd_responses::done_print_resp,
            sd_responses::done_sd_write_resp,
            sd_responses::file_deleted_resp,
            file_list,
            delete_file_resp,
            unknown_resp
        )),
        pair(space0, line_ending),
    )
}

pub fn greeting<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    value(
        Response::Greeting,
        alt((
            tag_no_case("start"),
            tag_no_case("grbl"),
            terminated(
                tag_no_case("marlin "),
                not_line_ending,
            ),
        )),
    )(input)
}

pub fn debug<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    map(
        alt((
            preceded(
                pair(
                    alt((
                        tag_no_case("debug_"),
                        peek(tag_no_case("compiled:")),
                    )),
                    space0,
                ),
                not_line_ending,
            ),
            tag_no_case("Init power off infomation."),
            // "File(bin) deleted.\n"
            // OR
            // "File deleted.\n"
            recognize(tuple((
                tag_no_case("File"),
                opt(tuple((
                    char('('),
                    many0(none_of(")\n\r")),
                    char(')'),
                ))),
                space0,
                tag_no_case("deleted."),
            ))),
            // "Deletion(bin) failed.\n"
            recognize(tuple((
                tag_no_case("Deletion"),
                opt(tuple((
                    char('('),
                    many0(none_of(")\n\r")),
                    char(')'),
                ))),
                space0,
                tag_no_case("failed."),
            ))),
            // size: \n
            // 591\n
            recognize(tuple((
                tag_no_case("size:"),
                space0,
                line_ending,
                digit1,
            ))),
        )),
        |s: &str| Response::Debug(s.to_string()),
    )(input)
}

pub fn ok_resp<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    map(
        preceded(
            // Matches "ok" with up to 2 dropped preceeding "ok\n" characters (2 of \n, o or k):
            // ok, okok, okokok, kok, ook
            alt((
                recognize(many_m_n(1, 3, tag_no_case("ok"))),
                tag_no_case("kok"),
                tag_no_case("ook"),
            )),
            opt(preceded(
                space1,
                alt((
                    map(feedback, |feedback| Some(feedback)),
                    map(not_line_ending, |unrecognized: &str| {
                        if unrecognized.len() > 0 {
                            warn!("Unrecognized feedback for response: \"ok {}\"", unrecognized);
                        }

                        None
                    }),
                )),
            ),
        )),
        |feedback| Response::Ok(feedback.flatten())
    )(input)
}

pub fn err_resp<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    map(
        preceded(
            pair(
                tag_no_case("error:"),
                space0,
            ),
            not_line_ending,
        ),
        |s: &str| {
            if s == "checksum mismatch" {
                Response::Warning(s.to_string())
            } else {
                Response::Error(s.to_string())
            }
        },
    )(input)
}

pub fn resend<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    map(
        delimited(
            tuple((
                alt((
                    tag_no_case("resend"),
                    tag_no_case("rs"),
                )),
                opt(char(':')),
                space0,
            )),
            u32_str(),
            space0,
        ),
        |line_number| Response::Resend(Resend { line_number }),
    )(input)
}

pub fn unknown_resp<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    value(
        Response::Unknown,
        pair(
            not(alt((
                // Do not match partial multi-line responses as unknown
                tag_no_case("Begin file list"),
                tag_no_case("Deletion failed, File:"),
                tag_no_case("echo"),
                tag_no_case("X:"),
                tag_no_case("T:"),
                tag_no_case("size:"),
            ))),
            opt(not_line_ending),
        ),
    )(input)
}

pub fn f32_str<'r>() -> impl FnMut (&'r str) ->  IResult<&'r str, f32> {
    map_res(
        recognize(pair(
            digit1,
            opt(pair(
                char('.'),
                digit1,
            ))
        )),
        |s: &str| s.parse(),
    )
}

pub fn u32_str<'r>() -> impl FnMut (&'r str) ->  IResult<&'r str, u32> {
    map_res(
        digit1,
        |s: &str| s.parse(),
    )
}
