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
}

#[derive(Clone, Debug, PartialEq)]
pub struct Resend {
    pub line_number: u32,
}


pub fn parse_many_responses<'r>(src: &'r str) -> IResult<&'r str, Vec<(String, Response)>> {
    let mut parser = preceded(
        // Quickly verify that the string contains a new line
        peek(pair(
            opt(not_line_ending),
            line_ending,
        )),
        // Parse each response
        many1(pair(
            response(),
            rest_len,
        )),
    );

    let (remainder, responses) = parser(src)?;

    let responses = responses
        .into_iter()
        .scan(0usize, |start_index, item| {
            let (response, len_after_response) = item;

            let end_index: usize = src.len() - len_after_response;
            let parsed_content = &src[*start_index..end_index];

            *start_index = end_index + 1;

            Some((parsed_content.to_string(), response))
        })
        .collect();

    Ok((remainder, responses))
}

pub fn response<'r>() -> impl FnMut(&'r str) -> IResult<&'r str, Response> {
    terminated(
        alt((
            greeting(),
            debug(),
            echo(),
            ok_resp(),
            err_resp(),
            resend(),
            feedback_resp(),
            file_list(),
            delete_file_resp(),
        )),
        pair(space0, line_ending),
    )
}

pub fn greeting<'r>() -> impl FnMut (&'r str) ->  IResult<&'r str, Response> {
    value(
        Response::Greeting,
        alt((
            tag_no_case("start"),
            tag_no_case("grbl"),
            tag_no_case("marlin"),
        )),
    )
}

pub fn debug<'r>() -> impl FnMut (&'r str) ->  IResult<&'r str, Response> {
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
        |s: &str| Response::Debug(s.to_string()),
    )
}

pub fn ok_resp<'r>() -> impl FnMut (&'r str) ->  IResult<&'r str, Response> {
    map(
        preceded(
            // Matches the following multiple "ok" strings with dropped characters:
            // ok, kok, ook, kook, okok
            tuple((
                many_m_n(0, 2, one_of("ok")),
                tag("ok"),
            )),
            opt(preceded(
                space1,
                feedback(),
            )),
        ),
        |feedback| Response::Ok(feedback),
    )
}

pub fn err_resp<'r>() -> impl FnMut (&'r str) ->  IResult<&'r str, Response> {
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
    )
}

pub fn resend<'r>() -> impl FnMut (&'r str) ->  IResult<&'r str, Response> {
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
    )
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
