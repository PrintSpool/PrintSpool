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
    Feedback
};


// TX: "N47 M24*38\n" (after the SD Card print ends)
//
// Done printing file\n\
// echo:0 hours 0 minutes\n\
// Writing to file: bin\n\
// echo:enqueing \"M84 X Y Z E\"\n\
// ok\n\
pub fn done_print_resp<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    value(
        Response::Ok(Some(Feedback::SDPrintComplete)),
        tuple((
            tag("Done printing file"),
            space0,
            line_ending,
            take_until("\nok"),
            tag("\nok"),
        )),
    )(input)
}

// Done saving file.\n
pub fn done_sd_write_resp<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    value(
        Response::Ok(Some(Feedback::SDWriteComplete)),
        tag_no_case("Done saving file."),
    )(input)
}

// File deleted:file.txok\n
pub fn file_deleted_resp<'r>(input: &'r str) ->  IResult<&'r str, Response> {
    map(
        recognize(pair(
            tag_no_case("File deleted:"),
            not_line_ending,
        )),
        |s: &str| Response::Debug(s.to_string())
    )(input)
}
