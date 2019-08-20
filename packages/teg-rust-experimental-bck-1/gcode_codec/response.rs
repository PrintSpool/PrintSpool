// extern crate combine;

type FeedbackKeyValue = (String, f32);

#[derive(Debug)]
pub enum Response {
    Greeting,
    Ok {
        values: Vec<FeedbackKeyValue>,
    },
    Feedback {
        values: Vec<FeedbackKeyValue>,
        // actualTemperatures:
        // targetTemperatures:
    },
    Debug,
    Echo,
    // TODO: Handle Firmware errrors as io::Error?
    Error {
        message: String,
    },
    Warning {
        message: String,
    },
    Resend {
        line_number: i32,
    }
}

fn parse_key_value_pair<'a, I>(words: &mut I) -> Option<FeedbackKeyValue>
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

    if word.contains('@') || word.chars().next() == Some('/') {
        // use recursion to skip this word
        return parse_key_value_pair(words);
    }

    let mut key_and_value = word.split(':');
    let mut key = key_and_value.next()?;
    let mut value = key_and_value.next()?.parse::<f32>().ok()?;

    if key == "t" {
        key = "e0";
    }
    if key == "w" {
        value = value * 1000.0;
    }

    Some((key.to_string(), value))
}

fn parse_feedback<'a, I>(mut words: I) -> Vec<FeedbackKeyValue>
where
    I: Iterator<Item = &'a str>,
{
    let mut feedback = Vec::new();

    while let Some(key_value) = parse_key_value_pair(&mut words) {
        feedback.push(key_value);
    }

    feedback
}

pub fn parse_response(src: String) -> Option<Response> {
    let mut sanitized_src = src
        .replace(|c: char| !c.is_ascii() || c == '\r', "")
        .replace(":", ": ");

    sanitized_src.make_ascii_lowercase();

    let mut words = sanitized_src.split_whitespace().peekable();

    let response = match words.peek()?.as_ref() {
        "start" | "grbl" | "marlin" => Response::Greeting,
        "debug_" | "compiled:" => Response::Debug,
        "echo:" => Response::Echo,
        "ok" | "ook" | "kok" | "okok" => {
            Response::Ok { values: parse_feedback(words.skip(1)) }
        },
        "error:" => {
            let message = sanitized_src.replacen("error:", "", 1);
            let is_warning = sanitized_src.starts_with("error:checksum mismatch");

            if is_warning {
                Response::Warning { message: message }
            } else {
                Response::Error { message: message }
            }
        },
        "resend:" | "rs:" | "resend" | "rs" => {
            let line_number = words.skip(1).next()?.parse::<i32>().ok()?;

            Response::Resend { line_number: line_number }
        },
        "t:" | "x:" => {
            Response::Feedback { values: parse_feedback(words) }
        }
        _ => {
            return None
        }
    };

    Some(response)
}
