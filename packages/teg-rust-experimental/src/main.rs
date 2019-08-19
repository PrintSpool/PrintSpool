extern crate bytes;
extern crate futures;
extern crate tokio;
extern crate tokio_serial;
extern crate nanomsg;

// use tokio::timer::Delay;
// use nanomsg::{Socket, Protocol, Error};

use futures::{Future, Stream};
// use std::time::{Duration, Instant};
use tokio_io::codec::Decoder;

use std::env;

mod gcode_codec;

#[cfg(unix)]
const DEFAULT_TTY: &str = "/dev/ttyUSB0";
#[cfg(windows)]
const DEFAULT_TTY: &str = "COM1";

// fn create_socket() -> Result<Socket, Error> {
//     let mut socket = Socket::new(Protocol::Pair)?;
//
//     // Create a new endpoint bound to the following protocol string. This returns
//     // a new `Endpoint` that lives at-most the lifetime of the original socket.
//     let mut endpoint = socket.bind("ipc:///tmp/rust-example-pipeline.ipc")?;
//
//     // socket.read_to_end(buf: &mut Vec<u8>)
//
//     Ok(socket)
// }

fn main() -> Result<(), std::io::Error> {
    let mut args = env::args();
    let tty_path = args.nth(1).unwrap_or_else(|| DEFAULT_TTY.into());

    let mut settings = tokio_serial::SerialPortSettings::default();
    settings.baud_rate = 115200;
    let mut port = tokio_serial::Serial::from_path(tty_path, &settings).unwrap();

    #[cfg(unix)]
    port.set_exclusive(false)
        .expect("Unable to set serial port exlusive");

    let (_, reader) = gcode_codec::GCodeCodec.framed(port).split();

    let printer = reader
        .for_each(|s| {
            println!("{:?}", s);
            Ok(())
        }).map_err(|e| eprintln!("{}", e));
    //
    // let when = Instant::now() + Duration::from_millis(100);
    // let task = Delay::new(when)
    //     .and_then(|_| {
    //         println!("Hello world!");
    //         Ok(())
    //     })
    //     .map_err(|e| panic!("delay errored; err={:?}", e));
    //
    // let socket = create_socket()?;

    tokio::run(printer);

    Ok(())
}
