extern crate bytes;
#[macro_use]
extern crate futures;
extern crate tokio;
extern crate tokio_serial;
extern crate nanomsg;

#[macro_use]
extern crate state_machine_future;

use tokio::timer::Delay;
use std::time::{Duration, Instant};
// use nanomsg::{Socket, Protocol, Error};

// use futures::{Future};

use std::env;

mod gcode_codec;
mod serial_gcode_comms;

use serial_gcode_comms::{SerialGCodeComms};

use futures::{Future, Poll, Stream};
use crate::tokio::codec::Decoder;

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

    // let mut settings = tokio_serial::SerialPortSettings::default();
    // settings.baud_rate = 115200;

    // println!("RX: {:?}", settings);
    // let mut port = tokio_serial::Serial::from_path(tty_path, &settings).unwrap();

    // #[cfg(unix)]
    // port.set_exclusive(false)
    //     .expect("Unable to set serial port exlusive");

    // let (_, reader) = gcode_codec::GCodeCodec.framed(port).split();

    // let printer = reader
    //     .for_each(|s| {
    //         println!("{:?}", s);
    //         Ok(())
    //     }).map_err(|e| eprintln!("{}", e));

    // tokio::run(printer);

    println!("Creating Comms");
    let mut comms_future = SerialGCodeComms::start(tty_path)
        .map_err(|e| panic!("GCode Comms Errored; err={:?}", e));

    println!("Starting Tokio!");

    let when = Instant::now() + Duration::from_millis(1000);
    let mut task = Delay::new(when)
        .map(|_| {
            println!("Hello world!");
            ()
        })
        // .map(|_| ())
        .map_err(|e| panic!("delay errored; err={:?}", e));


    let f = futures::future::lazy(move || {
        // tokio::spawn(comms_future);
        // comms_future.poll();
        task.poll();
        task.
        // tokio::spawn(task);
        futures::future::empty()
    });
    tokio::run(f);
    // tokio::run(futures::future::empty());
    // tokio::run(comms_future);

    // tokio::run(task);

    Ok(())
}
