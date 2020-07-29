use nom_gcode::GCode;

pub fn find_u32_arg(cmd: &GCode, key: char) -> Option<u32> {
    let (_, v) = cmd.arguments()
        .find(|(arg_key, _)| *arg_key == key)?;

    let v = *v.as_ref()?;

    if v < 0.0 || v > u32::MAX as f32 {
        None
    } else {
        Some(v as u32)
    }
}
