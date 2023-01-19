use crate::KlipperId;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct GcodeMacro {
    pub klipper_id: KlipperId,
    /// A list of G-Code commands to execute in place of "my_cmd". See
    /// docs/Command_Templates.md for G-Code format. This parameter must
    /// be provided.
    /// One may specify any number of options with a "variable_" prefix.
    /// The given variable name will be assigned the given value (parsed
    /// as a Python literal) and will be available during macro expansion.
    /// For example, a config with "variable_fan_speed = 75" might have
    /// gcode commands containing "M106 S{ fan_speed * 255 }". Variables
    /// can be changed at run-time using the SET_GCODE_VARIABLE command
    /// (see docs/Command_Templates.md for details). Variable names may
    /// not use upper case characters.
    pub gcode: Option<f64>,
    /// This option will cause the macro to override an existing G-Code
    /// command and provide the previous definition of the command via the
    /// name provided here. This can be used to override builtin G-Code
    /// commands. Care should be taken when overriding commands as it can
    /// cause complex and unexpected results. The default is to not
    /// override an existing G-Code command.
    pub rename_existing: Option<f64>,
    /// This will add a short description used at the HELP command or while
    /// using the auto completion feature. Default "G-Code macro"
    pub description: Option<f64>,
}
