use std::{fs::File, io::BufRead};
use std::{io, fs};

use three_d::Vec3;
use env_logger::Env;

fn main() {
    env_logger::Builder::from_env(Env::default().default_filter_or("debug")).init();

    let args: Vec<String> = std::env::args().collect();
    let filename = args.get(1)
        .expect("USEAGE: cargo run --release /path/to/file.gcode");

    let file = File::open(filename).expect("Failed to open 3d model or gcode file");
    let mut lines = io::BufReader::new(file)
        .lines()
        .map(|line| line.unwrap());

    // Y is vertical in order to align with the orientation of the rendering engine
    let machine_dimensions = Vec3::new(200f32, 100f32, 200f32);

    let gcode_bytes = fs::metadata(filename).unwrap().len().try_into().unwrap();

    slicer_render::render(&mut lines, gcode_bytes, machine_dimensions)
}
