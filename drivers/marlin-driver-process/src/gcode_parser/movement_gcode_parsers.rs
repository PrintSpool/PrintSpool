// TODO: Movement GCode parsing
use nom_gcode::GCode;
use printspool_protobufs::{MachineFlags, machine_message::DirectionOfMovement};

use crate::state_machine::Context;

use super::{
    allow_list_args,
    find_u32_arg,
};

pub fn parse_linear_move(
    cmd: &GCode,
    context: &mut Context,
) -> eyre::Result<()> {
    allow_list_args(cmd, &['E', 'F', 'X', 'Y', 'Z'])?;

    // TODO: feedrate feedback
    // let feedrate = find_u32_arg(cmd, "E");
    // context.feedback.feedrate = feedrate;

    context.machine_flags.set(MachineFlags::MOTORS_ENABLED, true);

    let absolute_positioning = context.machine_flags.contains(
        MachineFlags::ABSOLUTE_POSITIONING
    );

    let millimeters = context.machine_flags.contains(
        MachineFlags::MILLIMETERS
    );

    context.feedback.axes.iter_mut().for_each(|axis| {
        let address = axis.address
            .to_ascii_uppercase()
            .chars()
            .next();

        if axis.homed || absolute_positioning {
            let value = address.and_then(|address| find_u32_arg(cmd, address));

            if let Some(value) = value {
                let value = value as f32;

                let value = if millimeters {
                    value
                } else {
                    // inches
                    value * 25.4
                };

                let previous_target = axis.target_position;
                if absolute_positioning {
                    axis.target_position = value;
                } else {
                    axis.target_position += value;
                }

                axis.direction = if axis.target_position >= previous_target {
                    DirectionOfMovement::Forward as i32
                } else {
                    DirectionOfMovement::Reverse as i32
                };
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

    context.machine_flags.set(MachineFlags::MOTORS_ENABLED, true);

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
