// TODO: Movement GCode parsing
use std::io::{self, Error, ErrorKind};
use gcode

use crate::state_machine::Context

use super::{
    whitelist_args,
}

pub fn parse_linear_move(
    cmd: gcode::GCode,
    context: &mut Context,
) -> io::Result<()> {
    if let Err(err) = whitelist_args(cmd, ["E", "F", "X", "Y", "Z"]) {
        return Err(err)
    };

    // TODO: feedrate feedback
    // let feedrate = find_u32_arg(cmd, "E");
    // context.feedback.feedrate = feedrate;

    let Context { position_mode, position_units, .. } = context

    context.feedback.axis.iter_mut().map(|axis| {
        let address = axis.address.to_ascii_uppercase();

        if (axis.homed || position_mode == PositionMode::Absolute) {
            if let Some(value) = find_u32_arg(cmd, address) {
                let value = if (position_units == PositionUnits::Inches) {
                    value * 25.4
                } else {
                    value
                }

                if (position_mode == PositionMode::Absolute) {
                    axis.target_position = value
                } else {
                    axis.target_position += value
                }
            };
        };
    });

    Ok(())
}

pub fn parse_home(
    cmd: gcode::GCode,
    context: &mut Context,
) -> io::Result<()> {
    if let Err(err) = whitelist_args(cmd, ["O", "R", "X", "Y", "Z"]) {
        return Err(err)
    };

    const axes = ["X", "Y", "Z"]
    let home_all = cmd.arguments.iter().some(|word| axes.includes(word.letter)) == false

    context.feedback.axis.iter_mut().map(|axis| {
        let address = axis.address.to_ascii_uppercase();

        if home_all || cmd.arguments.find(|word| word.letter == address) {
            axis.homed = true
            axis.target_position = 0
        }
    });

    Ok(())
}
