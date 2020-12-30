mod find_u32_arg;
mod parse_gcode;

mod allow_list_args;
pub use allow_list_args::allow_list_args;

pub mod fan_mcode_parsers;
pub mod heater_mcode_parsers;
pub mod movement_gcode_parsers;

pub use {
    parse_gcode::parse_gcode,
    find_u32_arg::find_u32_arg,
};

#[derive(Copy, Clone, Debug, PartialEq)]
pub enum GCodeSynchronicity {
    Blocking,
    NonBlocking,
}

#[derive(Copy, Clone, Debug, PartialEq)]
pub enum PositionUnits {
    Inches,
    Millimetre,
}

#[derive(Copy, Clone, Debug, PartialEq)]
pub enum PositionMode {
    Relative,
    Absolute,
}
