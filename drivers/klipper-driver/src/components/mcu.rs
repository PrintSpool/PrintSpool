use printspool_proc_macros::define_component;

#[define_component]
pub struct Mcu {
    pub klipper_id: Option<String>,
    /// The serial port to connect to the MCU. If unsure (or if it
    /// changes) see the "Where's my serial port?" section of the FAQ.
    /// This parameter must be provided when using a serial port.
    pub serial: String,
    /// The baud rate to use. The default is 250000.
    pub baud: Option<u32>,
    /// If using a device connected to a CAN bus then this sets the unique
    /// chip identifier to connect to. This value must be provided when using
    /// CAN bus for communication.
    pub canbus_uuid: Option<String>,
    /// If using a device connected to a CAN bus then this sets the CAN
    /// network interface to use. The default is 'can0'.
    pub canbus_interface: Option<String>,
    /// This controls the mechanism the host will use to reset the
    /// micro-controller. The choices are 'arduino', 'cheetah', 'rpi_usb',
    /// and 'command'. The 'arduino' method (toggle DTR) is common on
    /// Arduino boards and clones. The 'cheetah' method is a special
    /// method needed for some Fysetc Cheetah boards. The 'rpi_usb' method
    /// is useful on Raspberry Pi boards with micro-controllers powered
    /// over USB - it briefly disables power to all USB ports to
    /// accomplish a micro-controller reset. The 'command' method involves
    /// sending a Klipper command to the micro-controller so that it can
    /// reset itself. The default is 'arduino' if the micro-controller
    /// communicates over a serial port, 'command' otherwise.
    pub restart_method: Option<f64>,
}

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
#[serde(rename_all = "snake_case")]
pub enum RestartMethod {
    Arduino,
    Cheetah,
    RpiUsb,
    Command,
}
