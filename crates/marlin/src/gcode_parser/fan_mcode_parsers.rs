use nom_gcode::GCode;

use crate::state_machine::Context;

use super::{
    allow_list_args,
    find_u32_arg,
};

pub fn parse_set_fan_speed(
    cmd: &GCode,
    context: &mut Context,
) -> eyre::Result<()> {
    allow_list_args(cmd, &['P', 'S', 'T'])?;

    let index = find_u32_arg(cmd, 'P').unwrap_or(0);
    let address = format!("f{}", index);

    let target_speed = find_u32_arg(cmd, 'S').unwrap_or(255);

    context.feedback.speed_controllers.iter_mut()
        .find(|sc| sc.address == address)
        .map(|sc| {
            sc.enabled = true;
            sc.target_speed = target_speed as f32;
            // repraps have no fan speed sensors
            sc.actual_speed = target_speed as f32;
        });

    Ok(())
}

pub fn parse_fan_off(
    cmd: &GCode,
    context: &mut Context,
) -> eyre::Result<()> {
    allow_list_args(cmd, &['P'])?;

    let index = find_u32_arg(cmd, 'P').unwrap_or(0);
    let address = format!("f{}", index);

    context.feedback.speed_controllers.iter_mut()
        .find(|sc| sc.address == address)
        .map(|sc| {
            sc.enabled = false;
            sc.target_speed = 0.0;
            // repraps have no fan speed sensors
            sc.actual_speed = 0.0;
        });

    Ok(())
}
