use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct HomingOverride {
    /// A list of G-Code commands to execute in place of G28 commands
    /// found in the normal g-code input. See docs/Command_Templates.md
    /// for G-Code format. If a G28 is contained in this list of commands
    /// then it will invoke the normal homing procedure for the printer.
    /// The commands listed here must home all axes. This parameter must
    /// be provided.
    pub gcode: f64,
    /// The axes to override. For example, if this is set to "z" then the
    /// override script will only be run when the z axis is homed (eg, via
    /// a "G28" or "G28 Z0" command). Note, the override script should
    /// still home all axes. The default is "xyz" which causes the
    /// override script to be run in place of all G28 commands.
    pub axes: Option<f64>,
    /// 
    pub set_position_x: Option<f64>,
    /// 
    pub set_position_y: Option<f64>,
    /// If specified, the printer will assume the axis is at the specified
    /// position prior to running the above g-code commands. Setting this
    /// disables homing checks for that axis. This may be useful if the
    /// head must move prior to invoking the normal G28 mechanism for an
    /// axis. The default is to not force a position for an axis.
    pub set_position_z: Option<f64>,
}
