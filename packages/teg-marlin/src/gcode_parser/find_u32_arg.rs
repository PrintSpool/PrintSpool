use gcode::GCode

pub find_u32_arg(cmd: GCode, letter: String) -> u32 {
    cmd.arguments
        .find(|word| word.letter == letter)
        .map(|word| word.value as u32)
}
