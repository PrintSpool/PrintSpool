// use combine::parser::char::{char, letter, spaces};
// use combine::{between, choice, many1, parser, sep_by, Parser};
// use combine::error::{ParseError, ParseResult};
// use combine::stream::{Stream, Positioned};
// use combine::stream::state::State;

type FeedbackKeyValue = (String, f32);

#[derive(Clone, Debug, PartialEq)]
pub struct Feedback {
    pub actual_temperatures: Vec<FeedbackKeyValue>,
    pub actual_positions: Vec<FeedbackKeyValue>,
}

#[derive(Clone, Debug, PartialEq)]
pub struct Response {
    pub payload: ResponsePayload,
    pub raw_src: String,
}

#[derive(Clone, Debug, PartialEq)]
pub enum ResponsePayload {
    Greeting,
    Ok( Feedback ),
    Feedback( Feedback ),
    Debug,
    Echo,
    Error(String),
    Warning {
        message: String,
    },
    Resend {
        line_number: u32,
    }
}

fn parse_key_value_pair<'a, I>(words: &mut I, feedback: &mut Feedback) -> Option<()>
where
    I: Iterator<Item = &'a str>,
{
    let mut word: String = words.next()?.to_string();
    if word == "Count" {
        return None;
    }

    if word.ends_with(':') {
        word.push_str(words.next()?);
        // word = &[word, words.next()?].join("");
    }

    // TODO: remove any characters from the end of the word and put them back on the stack
    // let removed_letter_count = 0
    // word.find(char::is_numeric);
    // word.split_at ;
    // char::is_numeric;

    if word.contains('@') || word.chars().next() == Some('/') {
        // use recursion to skip this word
        return parse_key_value_pair(words, feedback);
    }

    let mut key_and_value = word.split(':');
    let key = key_and_value.next()?;
    let value = key_and_value.next()?.parse::<f32>().ok()?;

    // if key == "w" {
    //     let value = value * 1000.0;
    // };

    let mut key = key.to_string().replace('t', "e");

    if key == "e" {
        key = "e0".to_string()
    }

    let key_values_list =
        if key.starts_with(&['e', 'b'][..]) {
            &mut feedback.actual_temperatures
        } else if key.starts_with(&['x', 'y', 'z'][..]) {
            &mut feedback.actual_positions
        } else {
            return Some(())
        };

    // skip duplicates
    if key_values_list.iter().find(|(k, _)| *k == key).is_some() {
        return Some(());
    }

    key_values_list.push((key, value));

    Some(())
}

fn parse_feedback<'a, I>(mut words: I) -> Feedback
where
    I: Iterator<Item = &'a str>,
{
    let mut feedback = Feedback {
        actual_positions: Vec::new(),
        actual_temperatures: Vec::new(),
    };

    while let Some(()) = parse_key_value_pair(&mut words, &mut feedback) {}

    feedback
}

pub fn parse_response(src: String) -> Option<Response> {
    let mut sanitized_src = src
        .replace(|c: char| !c.is_ascii() || c == '\r', "")
        .replace(":", ": ");

    sanitized_src.make_ascii_lowercase();
    // eprintln!("RX: {:?}", sanitized_src);

    let mut words = sanitized_src.split_whitespace().peekable();

    // let event = many1(letter());

    let payload = match *words.peek()? {
        "start" | "grbl" | "marlin" => ResponsePayload::Greeting,
        "debug_" | "compiled:" => ResponsePayload::Debug,
        "echo:" => ResponsePayload::Echo,
        "ok" | "ook" | "kok" | "okok" => {
            ResponsePayload::Ok( parse_feedback(words.skip(1)) )
        },
        "error:" => {
            let message = src.replacen("error:", "", 1);
            let is_warning = sanitized_src.starts_with("error:checksum mismatch");

            if is_warning {
                ResponsePayload::Warning { message: message }
            } else {
                ResponsePayload::Error(message)
            }
        },
        "resend:" | "rs:" | "resend" | "rs" => {
            let line_number = words.skip(1).next()?.parse::<u32>().ok()?;

            ResponsePayload::Resend { line_number }
        },
        "t:" | "x:" => {
            ResponsePayload::Feedback( parse_feedback(words) )
        }
        _ => {
            return None
        }
    };

    Some(Response {
        raw_src: src,
        payload,
    })
}


#[cfg(test)]
mod tests {
    use super::*;

// "ok t: 20.0 /0.0 b: 20.2 /0.0 t0: 20.0 /0.0 @: 0 b@: 0\n"
// IN  SerialRec(Ok { values: [("e0", 20.0), ("b", 20.2), ("t0", 20.0)] })

// "x: 0.00y: 0.00z: 0.00e: 0.00 count x:  0.00y: 0.00z: 0.00\n"
// IN  SerialRec(Feedback { values: [] })

    #[test]
    fn parses_ok_with_temperature_feedback() {
        let res_str = "ok t: 20.0 /0.0 b: 20.2 /0.0 t0: 20.0 /0.0 @: 0 b@: 0\n";
        let res = parse_response(res_str.to_string());

        if let Some(
            Response {
                payload: ResponsePayload::Ok(Feedback {
                    actual_temperatures,
                    actual_positions,
                }),
                ..
            },
        ) = res {
            assert_eq!(actual_temperatures, vec![
                ("t0".to_string(), 20.0),
                ("b".to_string(), 20.2),
            ]);
            assert_eq!(actual_positions, vec![]);
        } else {
            panic!("Expected Some(Ok(Feedback {{..}})), got: {:?}", res)
        }
    }

    // #[test]
    // fn parses_position_feedback() {
    //     let res_str = "x: 0.00y: 1.00z: 0.00e: 0.00 count x:  0.00y: 0.00z: 0.00\n";
    //     let res = parse_response(res_str.to_string());

    //     if let Some(ResponsePayload::Feedback { values }) = res {
    //         assert_eq!(values, vec![
    //             ("x".to_string(), 0.0),
    //             ("y".to_string(), 1.0),
    //             ("z".to_string(), 20.0),
    //             ("e".to_string(), 0.0),
    //         ]);
    //     } else {
    //         panic!("Expected Some(Feedback {{..}}), got: {:?}", res)
    //     }
    // }

}
