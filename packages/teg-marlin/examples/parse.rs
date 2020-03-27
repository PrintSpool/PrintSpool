extern crate gcode;

fn main() {
    if let Some(line) = gcode::parse("M109 S3").next() {
        line.gcodes().into_iter().for_each(|cmd| {
            eprintln!("GCode: {:?} {:?}", cmd, cmd.major_number());

            use gcode::Mnemonic::{
                Miscellaneous as M,
                // General as G,
            };
            // const MOVEMENT_GCODES = ['G0', 'G1']
            // const HEATER_MCODES = ['M109', 'M104', 'M140', 'M190', 'M116']
            // const EXTRUDER_MCODES = ['M109', 'M104', 'M116']
            // const BED_MCODES = ['M140', 'M190']
            // const BLOCKING_MCODES = ['M109', 'M190', 'M116']

            match (&cmd.mnemonic(), &cmd.major_number()) {
                | (M, 104)
                | (M, 109)
                | (M, 140)
                | (M, 190)
                | (M, 116) => {
                    parse_heater_mcode(cmd)
                }
                _ => {}
            }
        })
    }
}

fn parse_heater_mcode(_cmd: &gcode::GCode) {
    eprintln!("heater!")
}
