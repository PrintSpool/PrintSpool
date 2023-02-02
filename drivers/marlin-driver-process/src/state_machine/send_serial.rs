use printspool_machine::components::ControllerConfig;

use super::*;
use crate::gcode_parser::parse_gcode;

pub fn send_serial(
    effects: &mut Vec<Effect>,
    gcode_line: GCodeLine,
    context: &mut Context,
    is_polling: bool,
) {
    // Allow for a byte of spacing between receiving and sending over the serial port
    // The choice of 1 byte was arbitrary but sending without a spin lock seems to
    // loose GCodes.
    // let seconds_per_bit: u64 = (60 * 1000 * 1000 / context.baud_rate).into();
    // spin_sleep::sleep(Duration::from_micros(8 * seconds_per_bit));

    // eprintln!("TX: {:?}", gcode_line.gcode);

    context.push_gcode_tx(gcode_line.gcode.clone(), is_polling);

    let parser_result = parse_gcode(&gcode_line.gcode, context)
        .map_err(|err| warn!("{}", err));

    let ControllerConfig {
        long_running_code_timeout,
        fast_code_timeout,
        long_running_codes,
        blocking_codes,
        ..
    } = &context.controller.model;


    let mut duration = fast_code_timeout;
    let mut is_blocking = false;

    if let Ok(Some((mnemonic, major_number))) = parser_result {
        let gcode_macro = format!("{}{}", mnemonic, major_number);

        if long_running_codes.contains(&gcode_macro) {
            duration = long_running_code_timeout
        }

        is_blocking = blocking_codes.contains(&gcode_macro)
    };

    effects.push(Effect::SendSerial(gcode_line));
    if is_blocking {
        effects.push(
            Effect::CancelDelay { key: "tickle_delay".to_string() }
        );
    } else {
        effects.push(
            Effect::Delay {
                key: "tickle_delay".to_string(),
                // TODO: configurable delayFromGreetingToReady
                duration: Duration::from_millis(*duration),
                event: TickleSerialPort,
            },
        );
    }
}
