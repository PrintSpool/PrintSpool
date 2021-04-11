// use std::io::{Read, Write};
// use std::str;
use std::os::unix::io::FromRawFd;
use std::os::unix::io::IntoRawFd;
use nix;
use nom_gcode::{
    GCodeLine,
    Mnemonic::{
        // self,
        Miscellaneous as M,
        // General as G,
    },
};
use criterion::{
    criterion_group,
    criterion_main,
    Criterion,
    BenchmarkGroup,
    measurement::WallTime,
};

use serialport::TTYPort;

pub fn serial_emulator() -> (TTYPort, String) {
    // Open the next free pty.
    let next_pty_fd = nix::pty::posix_openpt(nix::fcntl::OFlag::O_RDWR).unwrap();

    // Grant access to the associated slave pty
    nix::pty::grantpt(&next_pty_fd).unwrap();

    // Unlock the slave pty
    nix::pty::unlockpt(&next_pty_fd).unwrap();

    #[cfg(any(
        target_os = "linux",
        target_os = "android",
        target_os = "emscripten",
        target_os = "fuchsia"
    ))]
    let ptty_name = nix::pty::ptsname_r(&next_pty_fd).unwrap();

    let tty = unsafe {
        TTYPort::from_raw_fd(next_pty_fd.into_raw_fd())
    };
    // {
    //     fd: next_pty_fd.into_raw_fd(),
    //     timeout: std::time::Duration::from_millis(100),
    //     exclusive: true,
    //     port_name: None,
    //     #[cfg(any(target_os = "ios", target_os = "macos"))]
    //     baud_rate,
    // };

    (tty, ptty_name)
}

pub fn respond_to_gcode(line: &String) -> Option<String> {
    if line.is_empty() {
        return None;
    }

    let (_, gcode) = nom_gcode::parse_gcode(&line).ok()?;

    let gcode = if let GCodeLine::GCode(gcode) = gcode? {
        gcode
    } else {
        return None;
    };

    let response = match (&gcode.mnemonic, &gcode.major) {
        // Set Hotend
        | (M, 104)
        // Set Bed
        | (M, 140) => {
            // let extruder = rand::thread_rng().gen_range(215f32..230f32);
            // let bed = rand::thread_rng().gen_range(50f32..55f32);

            format!(
                "T:{extruder} /0.0 B:{bed} /0.0 B@:0 @:0\nok\n",
                extruder = 220,
                bed = 50,
            )
        }
        (M, 105) => {
            // let extruder = rand::thread_rng().gen_range(215f32..230f32);
            // let bed = rand::thread_rng().gen_range(50f32..55f32);

            format!(
                "ok T:{extruder} /0.0 B:{bed} /0.0 B@:0 @:0\n",
                extruder = 220,
                bed = 50,
            )
        }
        (M, 114) => format!(
            "X:{x} Y:{y} Z:{z} E:0.00 Count X: 0.00Y:0.00Z:0.00\nok\n",
            x = 25.0,
            y = 50.0,
            z = 100.0,
        ),
        _ => "ok\n".to_string()
    };

    // trace!("Simulator responding to {:?} with {:?}", gcode, response);

    Some(response)
}

fn benchmark_marlin_driver(
    group: &mut BenchmarkGroup<WallTime>,
    benchmark_id: String,
) -> TTYPort {
    // We use a unique GCode to indicate the start of the print. This GCode must be the
    // first line of the print for the benchmark to work.
    let start_of_benchmark = "G1 X13.37 Y5.55558888 Z0.12345678 F1";
    use std::io::prelude::*;

    let (serial_port, tty_path) = serial_emulator();
    let mut writer = serial_port.try_clone_native().unwrap();
    let mut reader = std::io::BufReader::new(serial_port);
    let mut buf = String::new();

    println!("TTY path for {} benchmark: {}", benchmark_id, tty_path);

    if benchmark_id == "teg" {
        println!(
            r#"
            Teg Benchmark
            ----------------------------------------------------------------------------------------

            Your teg server has been stopped but there is still some manual steps to be done:

            1. SSH into your raspberry pi
            2. Use the following command to start an instance of teg-marlin
            making sure to replace ${{MACHINE_ID}} with your machine id:
                sudo DEBUG_TEG_SNAP=tegh RUST_LOG=info RUST_ENV=production TEG_TTY_OVERRIDE={} \
            /snap/tegh/current/teg-marlin ${{MACHINE_ID}}
            3. restart the teg server: `sudo snap start tegh`
            4. Create a gcode file to benchmark against - it should be moderately large
            (Mine is 17MBs)
            5. Add the following line to the start of the gcode file:
                G1 X13.37 Y5.55558888 Z0.12345678 F1
            6. Print the gcode file on the machine you set up for benchmarking in step 2.

            Note: The print will not complete successfully - this is expected. It will run until
            the benchmark has retreived enough samples for it's stats.

            "#,
            tty_path,
        )
    } else {
        println!(
            r#"
            Octoprint Benchmark
            ----------------------------------------------------------------------------------------

            1. Kill teg and teg-marlin:
                sudo snap stop tegh && sudo pkill teg-marlin
            2. Edit your ~/.octoprint/config.yaml and add the following:
                serial:
                    additionalPorts:
                    - /dev/pts/*
            3. Restart octoprint and select the serial port: {}
            4. Print the same gcode file you used to benchmark Teg.

            Note: The print will not complete successfully - this is expected. It will run until
            the benchmark has retreived enough samples for it's stats.

            "#,
            tty_path
        )
    }

    while reader.read_line(&mut buf).is_err() {};
    // println!("RX: {:?}", buf);

    // let greeting = include_str!("../src/serial_simulator/greeting.txt").trim().to_string();
    // let greeting = format!("{}\n", greeting);
    let greeting = "start\n".to_string();

    // println!("TX: {:?}", greeting);
    writer.write_all(greeting.as_bytes()).unwrap();

    loop {
        if let Some(response) = respond_to_gcode(&buf) {
            println!("TX: {:?}", response);
            writer.write_all(response.as_bytes()).unwrap();
        }
        buf.clear();

        while reader.read_line(&mut buf).is_err() {};

        // println!("RX: {:?}", buf);

        // Check if the GCode matches the one we use to signify the start of the print
        if buf.contains(start_of_benchmark) {
            println!("Start of print detected! Starting benchmark!");
            break
        }
    }

    // This benchmark measures the time from sending a response to the time the Driver sends the
    // next gcode during a print
    group.bench_function(&benchmark_id, |b| b.iter(|| {
        if let Some(response) = respond_to_gcode(&buf) {
            writer.write_all(response.as_bytes()).unwrap();
        }
        buf.clear();

        while reader.read_line(&mut buf).is_err() {};
    }));

    println!("{} benchmark complete!", benchmark_id);

    writer
}

fn gcode_stress_test(c: &mut Criterion) {
    let mut group = c.benchmark_group("gcode_stress_test");
    group.sample_size(1000);

    let _teg_tty = benchmark_marlin_driver(
        &mut group,
        "teg".into(),
    );
    let _octo_tty = benchmark_marlin_driver(
        &mut group,
        "octoprint".into(),
    );

    group.finish();
}

criterion_group!(benches,
    gcode_stress_test,
);
criterion_main!(benches);
