use async_trait::async_trait;
use printspool_driver_interface::{component::DriverComponent, driver::Driver, serde_json, DbId};
use schemars::JsonSchema;

pub mod components;
mod klipper_component;
mod klipper_driver;
mod klipper_driver_instance;
mod klipper_machine;
mod klipper_socket;

pub use klipper_component::KlipperComponent;
pub use klipper_driver::KlipperDriver;
pub use klipper_machine::KlipperDriverInstance;

// These types are used to document the purpose of configs
pub type KlipperId = String;
pub type KlipperIdList = String;
pub type KlipperPin = String;

pub const driver: KlipperDriver = KlipperDriver;
