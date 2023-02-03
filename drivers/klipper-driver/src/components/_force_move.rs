use printspool_proc_macros::define_component;
#[define_component]
pub struct ForceMove {
    /// Set to true to enable FORCE_MOVE and SET_KINEMATIC_POSITION
    /// extended G-Code commands. The default is false.
    pub enable_force_move: Option<f64>,
}
