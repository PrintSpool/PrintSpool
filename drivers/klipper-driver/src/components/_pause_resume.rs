use printspool_proc_macros::define_component;
#[define_component]
pub struct PauseResume {
    /// When capture/restore is enabled, the speed at which to return to
    /// the captured position (in mm/s). Default is 50.0 mm/s.
    pub recover_velocity: Option<f64>,
}
