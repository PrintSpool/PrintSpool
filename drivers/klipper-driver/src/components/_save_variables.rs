use printspool_proc_macros::define_component;
#[define_component]
pub struct SaveVariables {
    /// Required - provide a filename that would be used to save the
    /// variables to disk e.g. ~/variables.cfg
    pub filename: f64,
}
