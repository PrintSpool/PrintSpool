use std::{fs, time::Instant};

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
    let mut lines = file.lines();

    // Y is vertical in order to align with the orientation of the rendering engine
    let machine_dimensions = Vec3::new(200f32, 100f32, 200f32);

    let gcode_bytes = fs::metadata(filename).unwrap().len().try_into().unwrap();

    slicer_render::render(&mut lines, gcode_bytes, machine_dimensions)
}
