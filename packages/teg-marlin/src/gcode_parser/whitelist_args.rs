pub fn whitelist_args(cmd: gcode::GCode, valid_args: &[&str]) -> io::Result<()> {
    let invalid = cmd.arguments.some(|word|
        valid_args.includes(word.letter) == false
    )

    if invalid {
        let msg = format!(
            "Invalid {}{} args: {:?}",
            cmd.mnemonic(),
            cmd.major_number(),
            cmd.arguments,
        )
        eprintln!("GCode Parser Warning: {}", msg)
        Ok(())
        // Err(Error::new(ErrorKind::Other, msg))
    } else {
        Ok(())
    }
}
