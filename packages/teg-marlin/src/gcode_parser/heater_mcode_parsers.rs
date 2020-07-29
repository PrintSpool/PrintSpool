use nom_gcode::GCode;

use crate::state_machine::Context;

use super::{
    GCodeSynchronicity::{
        self,
        Blocking,
        // NonBlocking,
    },
    allow_list_args,
    find_u32_arg,
};

pub fn parse_hotend_setter(
    cmd: &GCode,
    context: &mut Context,
    blocking: GCodeSynchronicity,
    valid_args: &[char],
) -> anyhow::Result<()> {
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
) -> anyhow::Result<()> {
    allow_list_args(cmd, valid_args)?;

    let target = cmd.arguments()
        .find(|(k, _)| *k == 'R' || *k == 'S')
        .and_then(|(_, v)| v.as_ref());

    let heater = context.feedback.heaters
        .iter_mut()
        .find(|h| h.address == *address);

    if let (Some(target), Some(heater)) = (target, heater) {
        heater.target_temperature = *target;
        heater.blocking = blocking == Blocking;
    };

    Ok(())
}

pub fn parse_wait_for_temps(
    cmd: &GCode,
    context: &mut Context,
) -> anyhow::Result<()> {
    allow_list_args(&cmd, &['P', 'H', 'C'])?;

    let mut addresses = cmd.arguments()
        // Filter out arguments without values
        .filter_map(|(k, v)|
            v.map(|v| (k, v))
        )
        .map(|(k, v)| {
            if *k == 'C' {
                "c".to_string()
            } else {
                format!("e{}", v as u32)
            }
        });

    context.feedback.heaters.iter_mut()
        .find(|h| addresses.any(|address| address == h.address))
        .map(|h| h.blocking = true);

    Ok(())
}
