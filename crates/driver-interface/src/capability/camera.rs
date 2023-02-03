use printspool_proc_macros::printspool_collection;

/// # Video
#[printspool_collection]
pub struct CameraConfig {
    /// # Name
    #[validate(length(min = 1, message = "Name cannot be blank"))]
    pub name: String,

    /// # Source
    #[validate(length(min = 1, message = "Source cannot be blank"))]
    pub source: String,
}

impl printspool_config_form::Model for CameraConfig {
    fn form(all_fields: &Vec<String>) -> Vec<String> {
        all_fields.clone()
    }
}
