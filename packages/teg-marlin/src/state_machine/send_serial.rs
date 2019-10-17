use super::*;
use crate::gcode_parser::parse_gcode;

pub fn send_serial(effects: &mut Vec<Effect>, gcode_line: GCodeLine, context: &mut Context) {
    let parser_result = parse_gcode(&gcode_line.gcode, context);

    let crate::configuration::Controller {
        long_running_code_timeout,
        fast_code_timeout,
        long_running_codes,
        ..
    } = &context.controller;

    let duration = if let Ok(Some((mnemonic, major_number))) = parser_result {
        let gcode_macro = format!("{}{}", mnemonic, major_number);

        if long_running_codes.contains(&gcode_macro) {
            long_running_code_timeout
        } else {
            fast_code_timeout
        }
    } else {
        fast_code_timeout
    };

    effects.push(Effect::SendSerial(gcode_line));
    effects.push(
        Effect::Delay {
            key: "tickle_delay".to_string(),
            // TODO: configurable delayFromGreetingToReady
            duration: Duration::from_millis(*duration),
            event: TickleSerialPort,
        },
    );
}
