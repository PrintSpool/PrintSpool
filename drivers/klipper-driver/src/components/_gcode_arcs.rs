use printspool_proc_macros::define_component;
#[define_component]
pub struct GcodeArcs {
    /// An arc will be split into segments. Each segment's length will
    /// equal the resolution in mm set above. Lower values will produce a
    /// finer arc, but also more work for your machine. Arcs smaller than
    /// the configured value will become straight lines. The default is
    /// 1mm.
    pub resolution: Option<f64>,
}
