mod machine_config;
pub use machine_config::{ MachineConfig };

mod into_config_form;
pub mod resolvers;

mod combined_config_view;
pub use combined_config_view::CombinedConfigView;

#[derive(Debug, Clone)]
pub struct Feedrate {
    pub address: String,
    pub feedrate: f32,
    pub reverse_direction: bool,
    pub is_toolhead: bool,
}
