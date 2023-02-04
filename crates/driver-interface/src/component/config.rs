pub use combined_config_view::CombinedConfigView;

mod validate_model;
pub use validate_model::validate_model;

#[derive(Debug, Clone)]
pub struct Feedrate {
    pub address: String,
    pub feedrate: f32,
    pub reverse_direction: bool,
    pub is_toolhead: bool,
}
