use std::io::{self, Error, ErrorKind};
use gcode

use crate::state_machine::Context

use super::{
    GCodeSynchronicity::{
        self,
        Blocking,
        NonBlocking,
    },
    whitelist_args,
    find_u32_arg,
}

pub fn parse_hotend_setter(
    cmd: gcode::GCode,
    context: &mut Context,
    blocking: GCodeSynchronicity,
    valid_args: &[&str],
) -> io::Result<()> {
    let index = find_u32_arg(cmd, "T").unwrap_or(context.current_hotend_index)
    let address = format!("e{}", value)

    parse_heater_setter(address, cmd, &mut context, blocking, valid_args)
}

pub fn parse_heater_setter(
    address: String,
    cmd: gcode::GCode,
    context: &mut Context,
    blocking: GCodeSynchronicity,
    valid_args: &[&str],
) -> io::Result<()> {
    if let Err(err) = whitelist_args(cmd, ["B", "F", "R", "S", "T"]) {
        return Err(err)
    };

    let maybe_word = cmd.arguments.find(|word|
        word.letter == "R" || word.letter == "S"
    );

    let maybe_heater = context.heaters
        .iter_mut()
        .find(|h| h.address == "b");

    if let (Some(word), Some(heater)) = (maybe_word, maybe_heater) {
        heater.target_temperature = word.value()
        heater.blocking = blocking == Blocking
    };

    Ok(())
}

pub fn parse_wait_for_temps(
    cmd: gcode::GCode,
    context: &mut Context,
) -> io::Result<()> {
    if let Err(err) = whitelist_args(cmd, ["P", "H", "C"]) {
        return Err(err)
    };

    let addresses = cmd.arguments.map(|word| {
        if (word.letter == "C") {
             "c"
        } else {
            format!("e{}", word.value as u32)
        }
    });

    context.heaters.iter_mut()
        .find(|h| addresses.includes(h.address))
        .map(|h| h.blocking = true);

    Ok(())
}
