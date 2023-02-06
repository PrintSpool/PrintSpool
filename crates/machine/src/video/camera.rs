use printspool_proc_macros::define_component;

/// # Video
#[define_component]
pub struct CameraConfig {
    /// # Name
    #[validate(length(min = 1, message = "Name cannot be blank"))]
    pub name: String,

    /// # Source
    #[validate(length(min = 1, message = "Source cannot be blank"))]
    pub source: String,
}
