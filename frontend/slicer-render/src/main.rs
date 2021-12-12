use std::time::Instant;
use std::{fs::File, io::BufRead};
use std::{io, fs};

use itertools::Itertools;
use nom_gcode::{GCode, GCodeLine, Mnemonic};
use three_d::*;

mod cad_orbit_control;
use cad_orbit_control::CadOrbitControl;

struct GCodeParserState {
    position: Vec3,
    relative_movement: bool,
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let filename = args.get(1)
        .expect("USEAGE: cargo run --release /path/to/file.gcode");

    let now = Instant::now();

    let file = File::open(filename).expect("Failed to open 3d model or gcode file");
    let lines = io::BufReader::new(file).lines();

    // Y is vertical in order to align with the orientation of the rendering engine
    let machine_dimensions = Vec3::new(200f32, 100f32, 200f32);

    let mut bed_center = machine_dimensions / 2.0;
    // The center of the bed is at Z = 0
    bed_center[1] = 0.0;

    let gcode_bytes = fs::metadata(filename).unwrap().len();
    let mut gcode_count = 0;

    let mut state: GCodeParserState = GCodeParserState {
        position: Vec3::new(0.0, 0.0, 0.0),
        relative_movement: false,
    };

    let positions = lines.flat_map(|line| {
        gcode_count += 1;

        let line = line.unwrap();
        let gcode = match nom_gcode::parse_gcode(&line).unwrap().1 {
            // G0, G1 Move
            Some(GCodeLine::GCode(gcode @ GCode {
                mnemonic: Mnemonic::General,
                major,
                minor: 0,
                ..
            })) if major < 2 => {
                gcode
            }
            // G90 Absolute Positioning
            Some(GCodeLine::GCode(GCode {
                mnemonic: Mnemonic::General,
                major: 90,
                minor: 0,
                ..
            })) => {
                state.relative_movement = false;
                return None
            }
            // G91 Relative Positioning
            Some(GCodeLine::GCode(GCode {
                mnemonic: Mnemonic::General,
                major: 91,
                minor: 0,
                ..
            })) => {
                state.relative_movement = true;
                return None
            }
            _ => return None,
        };

        // let gcode = match &gcode {
        //     GCode {
        //         mnemonic: Mnemonic::General,
        //         major,
        //         minor,
        //         ..
        //     } if major < 2 => {
        //         gcode
        //     }
        //     _ => return None
        // };

        gcode.arguments().for_each(|(k, v)| {
            let index = match k {
                'X' => 0,
                'Z' => 1,
                'Y' => 2,
                _ => return (),
            };
            let v = match v {
                Some(v) => v,
                None => return (),
            };

            state.position[index] = if state.relative_movement {
                state.position[index] + v
            } else {
                *v
            };
        });

        Some(state.position.clone())
    });

    let edges = positions
        .tuple_windows()
        .map(|(p1, p2)| {
            let scale = Mat4::from_nonuniform_scale(
                (p1 - p2).magnitude(),
                1.0,
                1.0
            );
            let rotation = rotation_matrix_from_dir_to_dir(
                vec3(1.0, 0.0, 0.0),
                (p2 - p1).normalize(),
            );
            let translation = Mat4::from_translation(p1 - bed_center);

            translation * rotation * scale
        })
        .collect::<Vec<Mat4>>();

    println!("{} GCodes ({:.1}MB) sliced in {}ms", gcode_count, (gcode_bytes as f64 / 1_000_000f64), now.elapsed().as_millis());

    let window = Window::new(WindowSettings {
        title: "Picking!".to_string(),
        max_size: Some((1280, 720)),
        ..Default::default()
    })
    .unwrap();
    let context = window.gl().unwrap();

    let pipeline = ForwardPipeline::new(&context).unwrap();

    let max_dim = machine_dimensions[0]
        .max(machine_dimensions[1])
        .max(machine_dimensions[2]);

    let mut camera = Camera::new_perspective(
        &context,
        window.viewport().unwrap(),
        vec3(max_dim * 2.0, max_dim * 2.0, max_dim * 2.5),
        vec3(0.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        degrees(45.0),
        0.1,
        1000.0,
    )
    .unwrap();
    let mut control = CadOrbitControl::new(*camera.target(), 1.0, max_dim * 20.0);

    let mut cylinder = CPUMesh::cylinder(3);
    cylinder.transform(&Mat4::from_nonuniform_scale(1.0, 0.07, 0.07));

    let wireframe_material = PhysicalMaterial {
        name: "wireframe".to_string(),
        albedo: Color::new_opaque(50, 100, 50),
        roughness: 0.7,
        metallic: 0.8,
        opaque_render_states: RenderStates {
            cull: Cull::Back,
            ..Default::default()
        },
        ..Default::default()
    };

    let edges = InstancedModel::new_with_material(
        &context,
        &edges,
        &cylinder,
        wireframe_material.clone(),
    )
    .unwrap();


    let mut bed = Model::new_with_material(
        &context,
        &CPUMesh::square(),
        PhysicalMaterial {
            albedo: Color {
                r: 0,
                g: 0,
                b: 255,
                a: 100,
            },
            ..Default::default()
        },
    )
    .unwrap();

    bed.set_transformation(
        Mat4::from_nonuniform_scale(machine_dimensions[0], machine_dimensions[1], machine_dimensions[2])
        * Mat4::from_angle_x(degrees(90.0))
    );

    // Loader::load(
    //     &["suzanne.obj", "suzanne.mtl"],
    //     move |mut loaded| {
    //         let (meshes, materials) = loaded.obj("suzanne.obj").unwrap();
            // let mut monkey = Model::new_with_material(
            //     &context,
            //     &meshes[0],
            //     PhysicalMaterial::new(&context, &materials[0]).unwrap(),
            // )
            // .unwrap();
            // monkey.material.opaque_render_states.cull = Cull::Back;

    let lights = Lights {
        ambient: Some(AmbientLight {
            intensity: 0.4,
            color: Color::WHITE,
        }),
        directional: vec![
            DirectionalLight::new(
                &context,
                2.0,
                Color::WHITE,
                &vec3(-1.0, -1.0, -1.0),
            )
            .unwrap(),
            DirectionalLight::new(
                &context,
                2.0,
                Color::WHITE,
                &vec3(1.0, -1.0, 1.0),
            )
            .unwrap(),
            DirectionalLight::new(
                &context,
                1.0,
                Color::WHITE,
                &vec3(0.0, 1.0, 0.0),
            )
            .unwrap(),
        ],
        ..Default::default()
    };

    // main loop
    window
        .render_loop(move |mut frame_input| {
            let mut change = frame_input.first_frame;
            change |= camera.set_viewport(frame_input.viewport).unwrap();

            // for event in frame_input.events.iter() {
            //     match event {
            //         Event::MousePress {
            //             button, position, ..
            //         } => {
            //             if *button == MouseButton::Left {
            //                 let pixel = (
            //                     (frame_input.device_pixel_ratio * position.0) as f32,
            //                     (frame_input.device_pixel_ratio * position.1) as f32,
            //                 );
            //                 if let Some(pick) =
            //                     pick(&context, &camera, pixel, &[&monkey]).unwrap()
            //                 {
            //                     pick_mesh.set_transformation(Mat4::from_translation(pick));
            //                     change = true;
            //                 }
            //             }
            //         }
            //         _ => {}
            //     }
            // }

            change |= control
                .handle_events(&mut camera, &mut frame_input.events)
                .unwrap();

            // draw
            if change {
                Screen::write(
                    &context,
                    ClearState::color_and_depth(1.0, 1.0, 1.0, 1.0, 1.0),
                    || pipeline.render_pass(
                        &camera,
                        &[
                            // &monkey,
                            &edges,
                            &bed,
                        ],
                        &lights,
                    ),
                )
                .unwrap();
            }

            FrameOutput {
                swap_buffers: change,
                ..Default::default()
            }
        })
        .unwrap();
    //     },
    // );
}
