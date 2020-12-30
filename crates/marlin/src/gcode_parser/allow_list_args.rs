use nom_gcode::GCode;

pub fn allow_list_args(cmd: &GCode, valid_args: &[char]) -> anyhow::Result<()> {
    let invalid = cmd.arguments().any(|(key, _)| !valid_args.contains(key));

    if invalid {
        warn!("GCode args not on allow list: {}", cmd);
        Ok(())
        // Err(Error::new(ErrorKind::Other, msg))
    } else {
        Ok(())
    }
}
