use std::io::{self, Error, ErrorKind};
use gcode

use crate::state_machine::Context

use super::{
    whitelist_args,
}

pub fn parse_set_fan_speed(
    cmd: gcode::GCode,
    context: &mut Context,
) -> io::Result<()> {
    if let Err(err) = whitelist_args(cmd, ["P", "S", "T"]) {
        return Err(err)
    };

    let index = find_u32_arg_or(cmd, "P", 0)
    let address = format!("f{}", value)

    let target_speed = find_u32_arg(cmd, "S").unwrap_or(255)

    context.speed_controllers.iter_mut()
        .find(|sc| sc.address == address)
        .map(|sc| {
            sc.enabled = true
            sc.target_speed = target_speed
            // repraps have no fan speed sensors
            sc.actual_speed = target_speed
        });

    Ok(())
}

pub fn parse_fan_off(
    cmd: gcode::GCode,
    context: &mut Context,
) -> io::Result<()> {
    if let Err(err) = whitelist_args(cmd, ["P"]) {
        return Err(err)
    };

    let index = find_u32_arg_or(cmd, "P", 0)
    let address = format!("f{}", value)

    context.speed_controllers.iter_mut()
        .find(|sc| sc.address == address)
        .map(|sc| {
            sc.enabled = false
            sc.target_speed = 0
            // repraps have no fan speed sensors
            sc.actual_speed = 0
        });

    Ok(())
}
