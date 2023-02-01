use async_trait::async_trait;
use printspool_driver_interface::{component::DriverComponent, driver::Driver, serde_json, DbId};
use schemars::JsonSchema;

mod components;
mod klipper_component;
mod klipper_driver;
mod klipper_driver_instance;
mod klipper_machine;
mod klipper_socket;

use klipper_component::KlipperComponent;
use klipper_driver::KlipperDriver;
use klipper_machine::KlipperDriverInstance;

// These types are used to document the purpose of configs
type KlipperId = String;
type KlipperIdList = String;
type KlipperPin = String;

pub const driver: &dyn Driver = &KlipperDriver;
