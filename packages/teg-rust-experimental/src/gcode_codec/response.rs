extern crate combine;

use std::io;
use combine::{many1}

use combine::parser

#[derive(Debug)]
pub enum Response {
    Greeting,
    Ok {
        feedback: Response::Feedback,
    },
    Feedback {
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
        lineNumber: i32,
    }
};

fn parse_feedback(&mut words: std::iter::Iterator) {
    let mut feedback = HashMap::new();

    while let mut Some(word) = words.next {
        if word == "Count" {
            break;
        }

        if (word.endsWith(':')) {
            match (words.next()) {
                None => break;
                Some(nextWord) => word = word.push_str(nextWord)
            }
        }

        if word.contains('@') || word.chars().next() == Some('/') {
            continue;
        }

        if let mut [key, valueStr] = word.split(':').collect() {
            if key == "t" {
                key = "e0"
            }

            if let mut Some(value) = valueStr.parse<f32>() {
                if (key == 'w') {
                    value *= 1000
                }
                feedback.insert(key, value)
            }
        }
    }
}

pub fn parse_response(src: String) -> Result<Response, io::Error> {
    let trimmedSrc = src
        .replace(&['\u0000', '\r', '\n'], "")
        .trim()

    let mut words = trimmedSrc.split_whitespace()

    match words.peek() {
        "start" | "grbl " | "marlin" => Response::Greeting,
        "ok" | "ook" | "kok" | "okok" => {
            words.skip(1)
            parseFeedback(words)
        },
        "debug_" | "compiled:" => Response::Debug,
        "echo:" => Response::Echo,
        "error" => {
            let message = trimmedSrc.replace(["error:", "error"], "")
            let isWarning = trimmedSrc.startsWith("error:checksum mismatch")

            if (isWarning) {
                Response::Warning { message: message }
            } else {
                Response::Error { message: message }
            }
        },
        "resend" | "rs" => {
            match trimmedSrc.split(":").next() {
                None => Err(io::Error::new(io::ErrorKind::Other, "Invalid Resend Request")
                Some(lineNumberStr) => Response::Resend { lineNumber: lineNumberStr.parse<i32>() }
            }
        },
        "t:" | "x:" => {
            parseFeedback(words)
            Response::Feedback
        }
    }

    Ok(Response {})
}
