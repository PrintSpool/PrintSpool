use std::io::{self, Error, ErrorKind};

use gcode::Mnemonic::{
    Miscellaneous as M,
    // General as G,
};

use crate::state_machine::Context

use super::{
    movement_gcode_parsers::{
        parse_linear_move,
        parse_home,
    }
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
}

const M104_SET_HOTEND = 104
const M140_SET_BED = 140
const M141_SET_CHAMBER = 141

const M109_WAIT_FOR_HOTEND = 109
const M190_WAIT_FOR_BED = 190
const M191_WAIT_FOR_CHAMBER = 191

// Not supportd on Marlin. RepRap Firwmare only. Different args then other heater mcodes.
const M116_WAIT_FOR_TEMPS = 116

const M106_SET_FAN_SPEED = 106
const M107_FAN_OFF = 107

const G20_INCH_UNITS = 20
const G21_MM_UNITS = 21

const G90_ABSOLUTE_POSITIONING = 90
const G91_RELATIVE_POSITIONING = 91

const G28_HOME = 28

pub fn parse_gcode(gcode_line: String, context: &mut Context) -> io::Result<Option<gcode::GCode>> {
    let maybe_cmd = gcode::parse(gcode_line)
        .next()
        .and_then(|line| line.gcodes().into_iter().next())

    let result = if let Some(cmd) = maybe_cmd {
        println!("GCode: {:?} {:?}", cmd, cmd.major_number());

        match (&cmd.mnemonic(), &cmd.major_number()) {
            | (G, 0)
            | (G, 1) => {
                parse_linear_move(cmd, &mut context)
            }
            (G, G28_HOME) => {
                parse_home(cmd, &mut context)
            }
            (G, G20_INCH_UNITS) => {
                context.feedback.position_units = PositionUnits::Inches;
            }
            (G, G21_MM_UNITS) => {
                context.feedback.position_units = PositionUnits::Millimetre;
            }
            (G, G90_ABSOLUTE_POSITIONING) => {
                context.feedback.position_mode = PositionMode::Absolute;
            }
            (G, G91_RELATIVE_POSITIONING) => {
                context.feedback.position_mode = PositionMode::Relative;
            }
            (G, G91_RELATIVE_POSITIONING) => {
                context.feedback.position_mode = PositionMode::Relative;
            }
            (M, M104_SET_HOTEND) => {
                parse_hotend_setter(cmd, &mut context, NonBlocking, ["B", "F", "S", "T"])
            }
            (M, M109_WAIT_FOR_HOTEND) => {
                parse_hotend_setter(cmd, &mut context, Blocking, ["B", "F", "R", "S", "T"])
            }
            (M, M140_SET_BED) => {
                parse_heater_setter("b", cmd, &mut context, NonBlocking, ["S"])
            }
            (M, M190_WAIT_FOR_BED) => {
                parse_heater_setter("b", cmd, &mut context, Blocking, ["R", "S"])
            }
            (M, M141_SET_CHAMBER) => {
                parse_heater_setter("c", cmd, &mut context, NonBlocking, ["S"])
            }
            (M, M191_WAIT_FOR_CHAMBER) => {
                parse_heater_setter("c", cmd, &mut context, Blocking, ["R", "S"])
            }
            (M, M116_WAIT_FOR_TEMPS) => {
                parse_wait_for_temps(cmd, &mut context)
            }
            (M, M106_SET_FAN_SPEED) => {
                parse_set_fan_speed(cmd, &mut context)
            }
            (M, M107_FAN_OFF) => {
                parse_fan_off(cmd, &mut context)
            }
            _ => {}
        }

        if Err(err) = result {
            Err(err)
        } else {
            maybe_cmd
        }
    }
}
