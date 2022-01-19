use std::{fs, time::Instant};

use slicer_render::{RenderOptions, Renderer, Command};
use three_d::Vec3;
use env_logger::Env;
use log::info;

fn main() {
    env_logger::Builder::from_env(Env::default().default_filter_or("debug")).init();

    let args: Vec<String> = std::env::args().collect();
    let filename = args.get(1)
        .expect("USEAGE: cargo run --release /path/to/file.gcode");

    let now = Instant::now();
    let file = fs::read_to_string(filename)
        .expect("Failed to open 3d model or gcode file");

    info!("File loaded to memory in {}ms", now.elapsed().as_millis());
    // let mut lines = file.lines();

    // Y is vertical in order to align with the orientation of the rendering engine
    let machine_dimensions = Vec3::new(200f32, 100f32, 200f32);

    // let gcode_bytes: usize = fs::metadata(filename).unwrap().len().try_into().unwrap();

    let options = RenderOptions {
        file_names: vec![filename.clone()],
        machine_dimensions,
        infinite_z: false,
        always_show_model: false,
    };

    let mut renderer = Renderer::new();

    // let tx = renderer.tx();
    // std::thread::spawn(move || {
    //     loop {
    //         info!("up");
    //         let start = 5;
    //         let end = 59;
    //         for layer in  5..end {
    //             tx.send(Command::SetLayer(layer)).unwrap();
    //             std::thread::sleep(std::time::Duration::from_millis(30));
    //         }
    //         info!("down");
    //         for layer in  1..(end - start) {
    //             tx.send(Command::SetLayer(end - layer)).unwrap();
    //             std::thread::sleep(std::time::Duration::from_millis(30));
    //         }
    //     }
    // });

    renderer.send(Command::SetGCode(Some(file)));

    renderer.render_loop(options);
}
