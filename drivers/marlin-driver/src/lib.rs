use printspool_driver_interface::driver::Driver;

mod components;
mod marlin_component;
mod marlin_driver_instance;
mod marlin_machine_config;
mod receive_stream;
mod send_message;

pub const driver: &dyn Driver = &MarlinDriver;
