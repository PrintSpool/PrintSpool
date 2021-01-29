use eyre::{
    // eyre,
    Context as _,
};

use nom_gcode::{
    GCodeLine,
    Mnemonic::{
        self,
        Miscellaneous as M,
        General as G,
    },
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
) -> eyre::Result<Option<(Mnemonic, u32)>> {
    let (remainder, gcode) = nom_gcode::parse_gcode(&gcode_line)
        .with_context(|| "Failed to parse GCode")?;

    if remainder.len() > 0 {
        warn!("Partially parsed gcode line: {}", gcode_line);
    };

    let gcode = if let Some(GCodeLine::GCode(gcode)) = gcode {
        gcode
    } else {
        return Ok(None)
    };

    // eprintln!("GCode: {}", gcode);

    match (&gcode.mnemonic, &gcode.major) {
        | (G, 0)
        | (G, 1) => {
            parse_linear_move(&gcode, context)
        }
        (G, &G28_HOME) => {
            parse_home(&gcode, context)
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
            parse_hotend_setter(&gcode, context, NonBlocking, &['B', 'F', 'S', 'T'])
        }
        (M, &M109_WAIT_FOR_HOTEND) => {
            parse_hotend_setter(&gcode, context, Blocking, &['B', 'F', 'R', 'S', 'T'])
        }
        (M, &M140_SET_BED) => {
            parse_heater_setter(&"b", &gcode, context, NonBlocking, &['S'])
        }
        (M, &M190_WAIT_FOR_BED) => {
            parse_heater_setter(&"b", &gcode, context, Blocking, &['R', 'S'])
        }
        (M, &M141_SET_CHAMBER) => {
            parse_heater_setter(&"c", &gcode, context, NonBlocking, &['S'])
        }
        (M, &M191_WAIT_FOR_CHAMBER) => {
            parse_heater_setter(&"c", &gcode, context, Blocking, &['R', 'S'])
        }
        (M, &M116_WAIT_FOR_TEMPS) => {
            parse_wait_for_temps(&gcode, context)
        }
        (M, &M106_SET_FAN_SPEED) => {
            parse_set_fan_speed(&gcode, context)
        }
        (M, &M107_FAN_OFF) => {
            parse_fan_off(&gcode, context)
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
    }?;

    Ok(Some((gcode.mnemonic, gcode.major)))
}
