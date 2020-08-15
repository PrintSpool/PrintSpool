#[derive(Clone, Debug)]
pub struct Task
{
    pub id: u32,
    pub client_id: u32,
    // TODO: gcode_lines iterator. Does 'self lifetime do what I need?
    // gcode_lines: Option<Box<dyn std::slice::Iter<T: str>>>,
    pub gcode_lines: std::vec::IntoIter<String>,
    pub despooled_line_number: Option<u32>,
    pub machine_override: bool,
    pub started: bool,
}
