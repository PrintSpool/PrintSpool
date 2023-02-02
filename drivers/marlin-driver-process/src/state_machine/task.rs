use nom_gcode::{
    GCodeLine,
};

#[derive(Clone, Debug)]
pub struct Task
{
    pub id: crate::DbId,
    pub client_id: crate::DbId,
    // TODO: gcode_lines iterator. Does 'self lifetime do what I need?
    // gcode_lines: Option<Box<dyn std::slice::Iter<T: str>>>,
    pub gcode_lines: std::vec::IntoIter<String>,
    pub despooled_line_number: Option<u32>,
    pub machine_override: bool,
    pub started: bool,
}

impl Task {
    /// Get the next gcode skipping any empty lines or comments
    pub fn next_gcode(&mut self) -> Option<String> {
        self.gcode_lines.find_map(|mut gcode| {
            // return driver macros
            if gcode.starts_with('!') {
                return Some(gcode);
            };

            if let Some(semicolon) = gcode.find(';') {
                gcode = gcode[0..semicolon].to_string();
            }

            match nom_gcode::parse_gcode(&gcode) {
                // skip comments and empty lines
                | Ok((_, Some(GCodeLine::Comment(_))))
                | Ok((_, None)) => None,
                // return gcodes
                _ => Some(gcode),
            }
        })
    }
}
