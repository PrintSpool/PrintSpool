mod components;
pub use components::*;

mod klipper_component;
pub use klipper_component::KlipperComponent;

// These types are used to document the purpose of configs
pub type KlipperId = String;
pub type KlipperIdList = String;
pub type KlipperPin = String;
