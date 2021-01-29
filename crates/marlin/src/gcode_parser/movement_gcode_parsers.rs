// TODO: Movement GCode parsing
use nom_gcode::GCode;

use crate::state_machine::Context;

use super::{
    allow_list_args,
    find_u32_arg,
    PositionMode,
    PositionUnits,
};

pub fn parse_linear_move(
    cmd: &GCode,
    context: &mut Context,
) -> eyre::Result<()> {
    allow_list_args(cmd, &['E', 'F', 'X', 'Y', 'Z'])?;

    // TODO: feedrate feedback
    // let feedrate = find_u32_arg(cmd, "E");
    // context.feedback.feedrate = feedrate;

    let Context { position_mode, position_units, .. } = context;

    context.feedback.motors_enabled = true;

    context.feedback.axes.iter_mut().for_each(|axis| {
        let address = axis.address
            .to_ascii_uppercase()
            .chars()
            .next();

        if axis.homed || *position_mode == PositionMode::Absolute {
            let value = address.and_then(|address| find_u32_arg(cmd, address));

            if let Some(value) = value {
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
) -> eyre::Result<()> {
    allow_list_args(&cmd, &['O', 'R', 'X', 'Y', 'Z'])?;

    context.feedback.motors_enabled = true;

    const AXES: [char; 3] = ['X', 'Y', 'Z'];
    let home_all = cmd.arguments().any(|(k, _)| AXES.contains(k)) == false;

    context.feedback.axes.iter_mut()
        .filter(|axis| {
            let address = axis.address.to_ascii_uppercase();

            home_all || (
                address.len() == 1
                && cmd.arguments().any(|(k, _)| address.starts_with(*k))
            )
        }).for_each(|axis| {
            axis.homed = true;
            axis.target_position = 0.0;
        });

    Ok(())
}
