// TODO: Movement GCode parsing
use std::io;
use gcode::GCode;

use crate::state_machine::Context;

use super::{
    whitelist_args,
    find_u32_arg,
    PositionMode,
    PositionUnits,
};

pub fn parse_linear_move(
    cmd: &GCode,
    context: &mut Context,
) -> io::Result<()> {
    if let Err(err) = whitelist_args(cmd, &['E', 'F', 'X', 'Y', 'Z']) {
        return Err(err)
    };

    // TODO: feedrate feedback
    // let feedrate = find_u32_arg(cmd, "E");
    // context.feedback.feedrate = feedrate;

    let Context { position_mode, position_units, .. } = context;

    context.feedback.axes.iter_mut().for_each(|axis| {
        let maybe_address = axis.address
            .to_ascii_uppercase()
            .chars()
            .next();

        if axis.homed || *position_mode == PositionMode::Absolute {
            let maybe_value = maybe_address.and_then(|address| find_u32_arg(cmd, address));

            if let Some(value) = maybe_value {
                let value = value as f32;

                let value = if *position_units == PositionUnits::Inches {
                    value * 25.4
                } else {
                    value
                };

                if *position_mode == PositionMode::Absolute {
                    axis.target_position = value;
                } else {
                    axis.target_position += value;
                }
            };
        };
    });

    Ok(())
}

pub fn parse_home(
    cmd: &GCode,
    context: &mut Context,
) -> io::Result<()> {
    if let Err(err) = whitelist_args(&cmd, &['O', 'R', 'X', 'Y', 'Z']) {
        return Err(err)
    };

    const AXES: [char; 3] = ['X', 'Y', 'Z'];
    let home_all = cmd.arguments().iter().any(|word|
        AXES.iter().any(|a| *a == word.letter)
    ) == false;

    context.feedback.axes.iter_mut().for_each(|axis| {
        let address = axis.address
            .to_ascii_uppercase()
            .chars()
            .next();

        if home_all || cmd.arguments().iter().any(|word| Some(word.letter) == address) {
            axis.homed = true;
            axis.target_position = 0.0;
        }
    });

    Ok(())
}
