use state_machine_future::{StateMachineFuture, RentToOwn};
use futures::{Future, Poll, Stream, IntoFuture};
use crate::tokio::codec::Decoder;
// use futures::stream;

use std::io::{ErrorKind};
use crate::gcode_codec::{GCodeCodec, response::Response};

use tokio::timer::Delay;
use std::time::{Duration, Instant};

// struct MachineState<T: Stream> {
//     serial_port_reader: T,
// }

#[derive(StateMachineFuture)]
#[derive(Debug)]
pub enum SerialGCodeComms {
    // #[state_machine_future(start, transitions(NewSerialPort))]
    // Start,

    // #[state_machine_future(transitions(GreetingReceived, Error))]
    // NewSerialPort,

    // #[state_machine_future(transitions(Despoolable, Error))]
    // GreetingReceived,

    // #[state_machine_future(transitions(Despoolable,  Error, ShutDown))]
    // Idle,

    // #[state_machine_future(transitions(DespoolableToGPIO, DespoolableToSerial,  Error))]
    // Despoolable,

    // #[state_machine_future(transitions(Idle,  Error))]
    // DespoolableToGPIO,

    // #[state_machine_future(transitions(AwaitingSerialResponse,  Error))]
    // DespoolableToSerial,

    // #[state_machine_future(transitions(Idle, RequestingResend, Error))]
    // AwaitingSerialResponse,

    // #[state_machine_future(transitions(DespoolableToSerial, Error))]
    // RequestingResend,


    #[state_machine_future(start, transitions(GreetingReceived, ShutDown))]
    Start{
        tty_path: String,
    },

    #[state_machine_future(transitions(ShutDown, Error))]
    GreetingReceived,

    #[state_machine_future(ready)]
    ShutDown(()),

    #[state_machine_future(error)]
    Error(std::io::Error),
}


impl PollSerialGCodeComms for SerialGCodeComms {
    fn poll_start<'a>(
        start: &'a mut RentToOwn<'a, Start>
    ) -> Poll<AfterStart, std::io::Error> {
        println!("STARTING");
        let when = Instant::now() + Duration::from_millis(100);
        let mut task = Delay::new(when)
            .map_err(|e| panic!("delay errored; err={:?}", e))
            .and_then(|_| {
                println!("Hello world!");
                Ok(ShutDown(()))
            })
            .map_err(|e| std::io::Error::new(ErrorKind::Other, "oh no!"));
        let next_state = try_ready!(task.poll());

        transition!(next_state)

        println!("TASK IS READY");

        // futures::future::ok(GreetingReceived.into()).poll()

            // .map_err(|e| panic!("delay errored; err={:?}", e));

        // Working Hypothesis: the poll function needs a context to wake the thread with.
        // println!("{:?}", tokio::prelude::task::current());
        // let poll = tokio::spawn(task).into_future()
        //     .map(|_|
        //         GreetingReceived.into()
        //     )
        //     .map_err(|_| std::io::Error::new(std::io::ErrorKind::Other, "oh no!"))
        //     .poll();
        // println!("DELAY {:?}", Delay::new(when).poll());
        // println!("INSTA {:?}", futures::future::ok(()).map_err(|_: ()| ()).poll());
        // poll

        // let Start {tty_path} = start.take();

        // let mut settings = tokio_serial::SerialPortSettings::default();
        // settings.baud_rate = 115200;

        // println!("SETTINGS: {:?}", settings);
        // let mut port = tokio_serial::Serial::from_path(tty_path, &settings).unwrap();

        // #[cfg(unix)]
        // port.set_exclusive(false)
        //     .expect("Unable to set serial port exlusive");

        // let (_, reader) = GCodeCodec.framed(port).split();

        // let mut printer = reader
        //     .for_each(|s| {
        //         println!("{:?}", s);
        //         Ok(())
        //     })
        //     .map(|_|
        //         GreetingReceived.into()
        //     );
        //     // .map_err(|e| eprintln!("{}", e));

        // printer.poll()

        // reader
        //     .inspect(|s| {
        //         println!("RX: {:?}", s);
        //     })
        //     .filter(|response|
        //         match response {
        //             Response::Ok{ .. } | Response::Greeting => true,
        //             _ => false
        //         }
        //     )
        //     .take(1)
        //     .collect()
        //     .map(|_|
        //         GreetingReceived.into()
        //     )
        //     .inspect(|_| {
        //         println!("GREETING RECEIVED!!!!!");
        //     })
        //     .poll()
        // Ok(futures::Async::NotReady)
    }
    fn poll_greeting_received<'a>(
        _start: &'a mut RentToOwn<'a, GreetingReceived>
    ) -> Poll<AfterGreetingReceived, std::io::Error> {
        println!("SHUTTING DOWN");
        // Ok(Async::NotReady)
        transition!(ShutDown(()))
    }


    // fn poll_greeting_received<'a>() -> Poll<After, Error> {
    //     None
    // }
    // fn poll_idle<'a>() -> Poll<After, Error> {
    //     None
    // }
    // fn poll_despoolable<'a>() -> Poll<After, Error> {
    //     None
    // }
    // fn poll_despoolable_to_gpio<'a>() -> Poll<After, Error> {
    //     None
    // }
    // fn poll_despoolable_to_serial<'a>() -> Poll<After, Error> {
    //     None
    // }
    // fn poll_awaiting_serial_response<'a>() -> Poll<After, Error> {
    //     None
    // }
    // fn poll_requesting_resend<'a>() -> Poll<After, Error> {
    //     None
    // }
}