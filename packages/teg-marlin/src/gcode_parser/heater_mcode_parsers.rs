use std::io::{self};
use gcode::GCode;

use crate::state_machine::Context;

use super::{
    GCodeSynchronicity::{
        self,
        Blocking,
        // NonBlocking,
    },
    whitelist_args,
    find_u32_arg,
};

pub fn parse_hotend_setter(
    cmd: &GCode,
    context: &mut Context,
    blocking: GCodeSynchronicity,
    valid_args: &[char],
) -> io::Result<()> {
    let index = find_u32_arg(cmd, 'T').unwrap_or(context.current_hotend_index);
    let address = format!("e{}", index);

    parse_heater_setter(&address, cmd, context, blocking, valid_args)
}

pub fn parse_heater_setter(
    address: &str,
    cmd: &GCode,
    context: &mut Context,
    blocking: GCodeSynchronicity,
    valid_args: &[char],
) -> io::Result<()> {
    if let Err(err) = whitelist_args(cmd, valid_args) {
        return Err(err)
    };

    let maybe_word = cmd.arguments().iter().find(|word|
        word.letter == 'R'
        || word.letter == 'S'
    );

    let maybe_heater = context.feedback.heaters
        .iter_mut()
        .find(|h| h.address == *address);

    if let (Some(word), Some(heater)) = (maybe_word, maybe_heater) {
        heater.target_temperature = word.value;
        heater.blocking = blocking == Blocking;
    };

    Ok(())
}

pub fn parse_wait_for_temps(
    cmd: &GCode,
    context: &mut Context,
) -> io::Result<()> {
    if let Err(err) = whitelist_args(&cmd, &['P', 'H', 'C']) {
        return Err(err)
    };

    let mut addresses = cmd.arguments().iter().map(|word| {
        if word.letter == 'C' {
             "c".to_string()
        } else {
            format!("e{}", word.value as u32)
        }
    });

    context.feedback.heaters.iter_mut()
        .find(|h| addresses.any(|address| address == h.address))
        .map(|h| h.blocking = true);

    Ok(())
}
