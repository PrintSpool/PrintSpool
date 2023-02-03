use printspool_proc_macros::define_component;
#[define_component]
pub struct FirmwareRetraction {
    /// The length of filament (in mm) to retract when G10 is activated,
    /// and to unretract when G11 is activated (but see
    /// unretract_extra_length below). The default is 0 mm.
    pub retract_length: Option<f64>,
    /// The speed of retraction, in mm/s. The default is 20 mm/s.
    pub retract_speed: Option<f64>,
    /// The length (in mm) of *additional* filament to add when
    /// unretracting.
    pub unretract_extra_length: Option<f64>,
    /// The speed of unretraction, in mm/s. The default is 10 mm/s.
    pub unretract_speed: Option<f64>,
}
