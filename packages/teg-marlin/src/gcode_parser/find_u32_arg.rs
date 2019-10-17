use gcode::GCode;

pub fn find_u32_arg(cmd: &GCode, letter: char) -> Option<u32> {
    cmd.arguments()
        .iter()
        .find(|word| word.letter == letter)
        .map(|word| word.value as u32)
}
