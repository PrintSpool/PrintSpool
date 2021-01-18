use serde::{Deserialize, Serialize};

mod home;
use home::HomeMacro;

mod set_target_temperatures;
use set_target_temperatures::SetTargetTemperaturesMacro;

mod toggle_fans;
use toggle_fans::ToggleFansMacro;

mod toggle_heaters;
use toggle_heaters::ToggleHeatersMacro;

mod toggle_motors_enabled;
use toggle_motors_enabled::ToggleMotorsEnabledMacro;

mod move_continuous;
use move_continuous::MoveContinuousMacro;

mod move_by;
use move_by::MoveByMacro;

mod move_to;
use move_to::MoveToMacro;

mod move_utils;

use move_utils::MoveMacro;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum InternalMacro {
    Home(HomeMacro),
    SetTargetTemperatures(SetTargetTemperaturesMacro),
    ToggleFans(ToggleFansMacro),
    ToggleHeaters(ToggleHeatersMacro),
    ToggleMotorsEnabled(ToggleMotorsEnabledMacro),
    ContinuousMove(MoveContinuousMacro),
    MoveBy(MoveByMacro),
    MoveTo(MoveToMacro),
}

