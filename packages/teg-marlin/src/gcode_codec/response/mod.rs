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

mod echo;
pub use echo::echo;

mod feedback;
pub use feedback::*;

mod file_list;
pub use file_list::file_list;

pub type LineNumber = u32;

#[derive(Clone, Debug, PartialEq)]
pub enum Response {
    Greeting,
    Ok(Option<Feedback>),
    Feedback(Feedback),
    Debug(String),
    Echo(String),
    Error(String),
    Warning(String),
    Resend(LineNumber),
}

pub fn parse_response(src: &'r str) ->  IResult<&'r str, Response> {
    terminated(
        alt((
            greeting(),
            debug(),
            echo(),
            ok_resp(),
            err_resp(),
            resend(),
            feedback(),
            file_list(),
        )),
        pair(space0, line_ending),
    )
}

pub fn greeting() -> FnMut (&'r str) ->  IResult<&'r str, Response> {
    value(
        alt((
            tag_no_case("start"),
            tag_no_case("grbl"),
            tag_no_case("marlin"),
        )),
        Response::Greeting,
    )
}

pub fn debug() -> FnMut (&'r str) ->  IResult<&'r str, Response> {
    map(
        preceded(
            pair(
                alt((
                    tag_no_case("debug_"),
                    tag_no_case("compiled:"),
                )),
                space0,
            ),
            not_line_ending,
        ),
        |s| Response::Debug(s.to_string()),
    )
}

pub fn ok_resp() -> FnMut (&'r str) ->  IResult<&'r str, Response> {
    map(
        preceded(
            // Matches the following multiple "ok" strings with dropped characters:
            // ok, kok, ook, kook, okok
            tuple((
                many_m_n(one_of("ok"), 0, 2),
                tag("ok"),
            )),
            opt(preceeded(
                space1,
                feedback(),
            )),
        ),
        |feedback| Response::Ok(feedback.0),
    )
}

pub fn err_resp() -> FnMut (&'r str) ->  IResult<&'r str, Response> {
    map(
        preceded(
            pair(
                tag_no_case("error:"),
                space0,
            ),
            not_line_ending,
        ),
        |s| {
            if s == "checksum mismatch" {
                Response::Warning(s)
            } else {
                Response::Error(s)
            }
        },
    )
}

pub fn resend() -> FnMut (&'r str) ->  IResult<&'r str, Response> {
    map_res(
        delimited(
            tuple((
                alt((
                    tag_no_case("resend"),
                    tag_no_case("rs"),
                )),
                opt(char(':')),
                space0,
            )),
            digit1,
            space0,
        ),
        |s| Response::Resend(s.parse()),
    )
}

pub fn f32_str() -> FnMut (&'r str) ->  IResult<&'r str, f32> {
    map_res(
        recognize(pair(
            digit1,
            opt(pair(
                char('.'),
                digit1,
            ))
        )),
        |s| s.parse(),
    )
}
