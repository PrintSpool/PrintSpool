use std::{fs, time::Instant};

use slicer_render::{RenderOptions, Renderer, Command};
use three_d::Vec3;
use env_logger::Env;
use log::info;

fn main() {
    env_logger::Builder::from_env(Env::default().default_filter_or("debug")).init();

    let args: Vec<String> = std::env::args().collect();
    let file_name = args.get(1)
        .expect("USEAGE: cargo run --release /path/to/file.gcode");

    let now = Instant::now();
    // let file = fs::read_to_string(file_name)
    //     .expect("Failed to open 3d model or gcode file");

    let file_content = fs::read(file_name)
        .expect("Failed to open 3d model or gcode file");

    info!("File loaded to memory in {}ms", now.elapsed().as_millis());
    // let mut lines = file.lines();

    // Y is vertical in order to align with the orientation of the rendering engine
    let machine_dimensions = Vec3::new(200f32, 100f32, 200f32);

    // let gcode_bytes: usize = fs::metadata(file_name).unwrap().len().try_into().unwrap();

    let options = RenderOptions {
        machine_dimensions,
        infinite_z: false,
    };

    let mut renderer = Renderer::new(options);

    let tx = renderer.tx();
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

    std::thread::spawn(move || {
        loop {
            // for position in  (-50..50).step_by(5) {
            //     tx.send(Command::SetPosition(Vec3 {
            //         x: position as f32,
            //         y: 0.0,
            //         z: 0.0,
            //     })).unwrap();
            //     std::thread::sleep(std::time::Duration::from_millis(30));
            // }
            // tx.send(Command::SetPosition(Vec3 {
            //     x: 50.0,
            //     y: 0.0,
            //     z: 0.0,
            // })).unwrap();
            for rotation in  (0..360).step_by(5) {
                tx.send(Command::SetRotation(Vec3 {
                    x: 0.0,
                    y: 0.0,
                    z: rotation as f32,
                })).unwrap();
                std::thread::sleep(std::time::Duration::from_millis(30));
            }
        }
    });


    // renderer.set_gcode(Some(file));

    renderer.add_model(
        file_name.clone(),
        file_content,
    );

    renderer.render_loop();
}
