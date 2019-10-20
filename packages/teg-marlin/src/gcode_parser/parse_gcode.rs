use std::io;

use gcode::Mnemonic::{
    Miscellaneous as M,
    General as G,
};

use crate::state_machine::Context;

use super::{
    movement_gcode_parsers::{
        parse_linear_move,
        parse_home,
    },
    heater_mcode_parsers::{
        parse_hotend_setter,
        parse_heater_setter,
        parse_wait_for_temps,
    },
    fan_mcode_parsers::{
        parse_set_fan_speed,
        parse_fan_off,
    },
    GCodeSynchronicity::{
        Blocking,
        NonBlocking,
    },
    PositionMode,
    PositionUnits,
};

const M104_SET_HOTEND: u32 = 104;
const M140_SET_BED: u32 = 140;
const M141_SET_CHAMBER: u32 = 141;

const M109_WAIT_FOR_HOTEND: u32 = 109;
const M190_WAIT_FOR_BED: u32 = 190;
const M191_WAIT_FOR_CHAMBER: u32 = 191;

// Not supportd on Marlin. RepRap Firwmare only. Different args then other heater mcodes.
const M116_WAIT_FOR_TEMPS: u32 = 116;

const M106_SET_FAN_SPEED: u32 = 106;
const M107_FAN_OFF: u32 = 107;

const G20_INCH_UNITS: u32 = 20;
const G21_MM_UNITS: u32 = 21;

const G90_ABSOLUTE_POSITIONING: u32 = 90;
const G91_RELATIVE_POSITIONING: u32 = 91;

const G28_HOME: u32 = 28;

const M17_ENABLE_STEPPERS: u32 = 17;

pub fn parse_gcode(
    gcode_line: &String,
    context: &mut Context,
) -> io::Result<Option<(gcode::Mnemonic, u32)>> {
    let maybe_line = gcode::parse(&gcode_line).next();
    let mut maybe_cmd_tuple = None;

    let result = if let Some(line) = maybe_line {
        if let Some(cmd) = line.gcodes().into_iter().next() {
            // println!("GCode: {:?} {:?}", cmd, cmd.major_number());
            maybe_cmd_tuple = Some((cmd.mnemonic(), cmd.major_number()));

            match (&cmd.mnemonic(), &cmd.major_number()) {
                | (G, 0)
                | (G, 1) => {
                    parse_linear_move(&cmd, context)
                }
                (G, &G28_HOME) => {
                    parse_home(&cmd, context)
                }
                (G, &G20_INCH_UNITS) => {
                    context.position_units = PositionUnits::Inches;
                    Ok(())
                }
                (G, &G21_MM_UNITS) => {
                    context.position_units = PositionUnits::Millimetre;
                    Ok(())
                }
                (G, &G90_ABSOLUTE_POSITIONING) => {
                    context.position_mode = PositionMode::Absolute;
                    Ok(())
                }
                (G, &G91_RELATIVE_POSITIONING) => {
                    context.position_mode = PositionMode::Relative;
                    Ok(())
                }
                (M, &M104_SET_HOTEND) => {
                    parse_hotend_setter(&cmd, context, NonBlocking, &['B', 'F', 'S', 'T'])
                }
                (M, &M109_WAIT_FOR_HOTEND) => {
                    parse_hotend_setter(&cmd, context, Blocking, &['B', 'F', 'R', 'S', 'T'])
                }
                (M, &M140_SET_BED) => {
                    parse_heater_setter(&"b", &cmd, context, NonBlocking, &['S'])
                }
                (M, &M190_WAIT_FOR_BED) => {
                    parse_heater_setter(&"b", &cmd, context, Blocking, &['R', 'S'])
                }
                (M, &M141_SET_CHAMBER) => {
                    parse_heater_setter(&"c", &cmd, context, NonBlocking, &['S'])
                }
                (M, &M191_WAIT_FOR_CHAMBER) => {
                    parse_heater_setter(&"c", &cmd, context, Blocking, &['R', 'S'])
                }
                (M, &M116_WAIT_FOR_TEMPS) => {
                    parse_wait_for_temps(&cmd, context)
                }
                (M, &M106_SET_FAN_SPEED) => {
                    parse_set_fan_speed(&cmd, context)
                }
                (M, &M107_FAN_OFF) => {
                    parse_fan_off(&cmd, context)
                }
                | (M, &M17_ENABLE_STEPPERS) => {
                    context.feedback.motors_enabled = true;
                    Ok(())
                }
                // disable steppers
                | (M, 18)
                | (M, 84) => {
                    context.feedback.motors_enabled = false;
                    Ok(())
                }
                _ => Ok(())
            }
        } else {
            Ok(())
        }
    } else {
        Ok(())
    };

    if let Err(err) = result {
        Err(err)
    } else if let Some(cmd_tuple) = maybe_cmd_tuple {
        Ok(Some(cmd_tuple))
    } else {
        Ok(None)
    }
}
