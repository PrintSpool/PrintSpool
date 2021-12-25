use itertools::Itertools;
use nom_gcode::{GCode, GCodeLine, Mnemonic};
use serde::Deserialize;
use three_d::*;

mod cad_orbit_control;
use cad_orbit_control::CadOrbitControl;

mod cad_bounding_box;
use cad_bounding_box::CadBoundingBox;

use wasm_bindgen::{prelude::*, JsCast};

extern crate console_error_panic_hook;
use std::{panic, io::Cursor};
use log::{ info, warn };

#[cfg(target_arch = "wasm32")]
extern crate wee_alloc;

// Use `wee_alloc` as the global allocator.
#[cfg(target_arch = "wasm32")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

struct GCodeParserState {
    position: Vec3,
    relative_movement: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RenderOptions {
    file_names: Vec<String>,
    machine_dimensions: Vec3,
}

struct SlicerRenderer {
    gcode_bytes: usize,
    options: RenderOptions,
}

#[wasm_bindgen]
pub fn render_string(
    model: &[u8],
    gcode: Option<String>,
    options: &JsValue,
) {
    console_log::init_with_level(log::Level::Debug)
        .expect("Error initializing logging");
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let mut options: RenderOptions = options.into_serde().expect("Invalid RenderOptions");

    // Y is vertical in order to align with the orientation of the rendering engine
    let d = &options.machine_dimensions;
    options.machine_dimensions = Vec3::new(d[0], d[2], d[1]);

    // let machine_dimensions = Vec3::new(235f32, 100f32, 235f32);
    let gcode = gcode.unwrap_or("".into());

    let mut lines = gcode
        .lines()
        .map(|line| line);

    SlicerRenderer {
        gcode_bytes: gcode.len(),
        options,
    }.render(
        Some(model),
        &mut lines,
    );
}

impl SlicerRenderer {
    pub fn render(
        self,
        model: Option<&[u8]>,
        gcode_lines: &mut dyn Iterator<Item = &str>,
    ) {
        // let now = instant::Instant::now();
        let machine_dim = self.options.machine_dimensions;
        let mut bed_center = machine_dim / 2.0;
        // The center of the bed is at Z = 0
        bed_center[1] = 0.0;

        let window = Window::new(WindowSettings {
            title: "Slicer Render".to_string(),
            max_size: Some((1280, 500)),
            // max_size: Some((1280, 720)),
            ..Default::default()
        })
            .expect("Error creating rendering window");

        let context = window.gl().expect("Error creating GL context");

        let pipeline = ForwardPipeline::new(&context)
            .expect("Forward pipeline error");

        let max_dim = machine_dim[0]
            .max(machine_dim[1])
            .max(machine_dim[2]);

        let mut camera = Camera::new_perspective(
            &context,
            window.viewport().expect("Viewport error"),
            vec3(max_dim * 2.0, max_dim * 2.0, max_dim * 2.5),
            vec3(0.0, 0.0, 0.0),
            vec3(0.0, 1.0, 0.0),
            degrees(45.0),
            0.1,
            100000.0,
        )
            .expect("camera error");

        let mut control = CadOrbitControl::new(*camera.target(), 1.0, max_dim * 20.0);

        // Load Models
        // ----------------------------------------------------------------------------------
        let now = instant::Instant::now();

        let model_bytes = model.as_ref().map(|m| m.len()).unwrap_or(0);

        let model = model.and_then(|model| {
            if model.is_empty() {
                return None;
            }

            let file_name = self.options.file_names.iter().next()
                .expect("model_file_name cannot be null if model is set");

            info!("Model ({:?}) Size: {:?}MB", file_name, model_bytes / 1_000_000);
            info!("GCode Size: {:?}MB", self.gcode_bytes / 1_000_000);

            let (cpu_mesh, _center) = if file_name.ends_with(".stl") {
                let mut reader = Cursor::new(model);
                // stl_io implementation
                // let mesh = stl_io::read_stl(&mut reader).unwrap();
                // let positions = mesh.vertices
                //     .into_iter()
                //     // Y is vertical in rendering
                //     .map(|v| [v[0], v[2], v[1]])
                //     .flatten()
                //     .collect::<Vec<f32>>();

                // nom_stl implmenetation
                let mesh = nom_stl::parse_stl(&mut reader).unwrap();
                let verticies = mesh.vertices_ref().collect::<Vec<_>>();

                // Getting the bounds of the model
                let mut min = [f32::MAX; 2];
                let mut max = [f32::MIN; 2];
                for v in &verticies {
                    for (val, min) in v[0..2].iter().zip(min.iter_mut()) {
                        if val < min {
                            *min = *val
                        }
                    }
                    for (val, max) in v[0..2].iter().zip(max.iter_mut()) {
                        if val > max {
                            *max = *val
                        }
                    }
                }

                let center = min.iter()
                    .zip(max.iter())
                    .map(|(min, max)| (min + max) / 2f32)
                    .collect::<Vec<_>>();

                info!("GCode Min: {:?} Max: {:?} Center {:?}", min, max, center);

                let positions = verticies
                    .into_iter()
                    // Centering the model on x = 0, y = 0 (in CAD coordinates)
                    .map(|v| [v[0] - center[0], v[1] - center[1], v[2]])
                    // .map(|v| [v[0], v[1], v[2]])
                    .flatten()
                    .collect::<Vec<f32>>();

                let normals = mesh.triangles()
                    .into_iter()
                    .map(|t| [t.normal(), t.normal(), t.normal()])
                    .flatten()
                    // .map(|t| t.normal())
                    .map(|v| [v[0], v[1], v[2]])
                    .flatten()
                    .collect::<Vec<f32>>();

                let cpu_mesh = CPUMesh {
                    positions,
                    normals: Some(normals),
                    ..Default::default()
                };

                (cpu_mesh, center)
            } else {
                panic!("Only .stl files are supported for now");
            };

            // let model = Model::new(&context, &cpu_mesh).unwrap();
            let model_material = PhysicalMaterial {
                name: "cad-model".to_string(),
                albedo: Color::new_opaque(255, 255, 255),
                roughness: 0.7,
                metallic: 0.9,
                opaque_render_states: RenderStates {
                    cull: Cull::Back,
                    ..Default::default()
                },
                ..Default::default()
            };

            let mut model = Model::new_with_material(
                &context,
                &cpu_mesh,
                model_material,
            )
            .unwrap();

            // Rotate about the center of the object
            model.set_transformation(
                // 1.0
                // Mat4::from_translation(Vec3::new(center[0], 0f32, -center[1]))
                Mat4::from_angle_x(degrees(270.0))
                // * Mat4::from_translation(Vec3::new(-center[0], -center[1], 0f32))
            );

            info!("Parsed STL model ({:.1}MB) in {}ms", (model_bytes as f64 / 1_000_000f64), now.elapsed().as_millis());

            Some(model)
        });

        // Load GCode
        // ----------------------------------------------------------------------------------

        let now = instant::Instant::now();
        let mut gcode_count = 0;
        let mut gcode_model: Option<InstancedModel<PhysicalMaterial>> = None;

        let mut gcode_layer_indexes = Vec::with_capacity(100);
        gcode_layer_indexes.push(0usize);

        let mut state: GCodeParserState = GCodeParserState {
            position: Vec3::new(0.0, 0.0, 0.0),
            relative_movement: false,
        };

        let mut previous_layer_z = 0f32;
        let mut top_layer = 0usize;

        let positions = gcode_lines.flat_map(|line| {
            gcode_count += 1;

            let (_, gcode) = nom_gcode::parse_gcode(&line)
                .expect("Error parsing gcode");

            let gcode = match gcode {
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
                // G28 HOME
                Some(GCodeLine::GCode(gcode @ GCode {
                    mnemonic: Mnemonic::General,
                    major: 28,
                    minor: 0,
                    ..
                })) => {
                    info!("G28:  {:?}", gcode.to_string());
                    if gcode.arguments().next() == None {
                        state.position = Vec3::new(0.0, 0.0, 0.0);
                    } else {
                        for (axis, _) in gcode.arguments() {
                            let index = match axis {
                                'X' => 0,
                                'Y' => 1,
                                'Z' => 2,
                                'E' => continue,
                                _ => {
                                    warn!("Invalid G28 Axis: {:?}", axis);
                                    continue;
                                }
                            };
                            state.position[index] = 0.0;
                        }
                    }
                    return None
                }
                // G92 SET POSITION
                Some(GCodeLine::GCode(gcode @ GCode {
                    mnemonic: Mnemonic::General,
                    major: 92,
                    minor: 0,
                    ..
                })) => {
                    for (axis, val) in gcode.arguments() {
                        info!("G92:  {:?}", gcode.to_string());
                        let val = if let Some(val) = val {
                            val
                        } else {
                            warn!("G92 missing position value");
                            continue
                        };

                        let index = match axis {
                            'X' => 0,
                            'Y' => 1,
                            'Z' => 2,
                            'E' => continue,
                            _ => {
                                warn!("Invalid G28 Axis: {:?}", axis);
                                continue;
                            }
                        };
                        state.position[index] = *val;
                    }
                    return None
                }
                _ => return None,
            };

            gcode.arguments().for_each(|(k, v)| {
                let index = match k {
                    'X' => 0,
                    'Z' => 1,
                    'Y' => 2,
                    // Incrementing the layer when an extruder is done on a new z-plane
                    'E' if previous_layer_z != state.position[1] => {
                        previous_layer_z = state.position[1];
                        top_layer += 1;
                        return ()
                    }
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

            Some((top_layer, state.position.clone()))
        });

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

        let gcode_transforms = positions
            .enumerate()
            .tuple_windows()
            .map(|((_i1, (l1, p1)), (i2, (l2, p2)))| {
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

                // Store the layer indexes seperately so that this vec can be sliced and used
                // without allocation on layer selection to update the model
                if l1 != l2 {
                    gcode_layer_indexes.push(i2)
                }

                translation * rotation * scale
            })
            .collect::<Vec<_>>();
            // .group_by(|(layer, _)| *layer)

        if gcode_transforms.is_empty() {
            warn!("No printable GCode layers found!");
        } else {
            info!(
                "{} GCodes ({:.1}MB) sliced in {}ms",
                gcode_count,
                (self.gcode_bytes as f64 / 1_000_000f64),
                now.elapsed().as_millis(),
            );
        };

        // DOM Inputs
        // ----------------------------------------------------------------------------------
        let websys_window = web_sys::window().unwrap();
        let document = websys_window
            .document()
            .unwrap();

        let mut previous_gcode_layer_slider_val = 0;
        let gcode_layer_slider = document.get_elements_by_name("gcode-layer-slider")
            .item(0)
            .unwrap()
            .dyn_into::<web_sys::HtmlInputElement>()
            .unwrap();

        gcode_layer_slider.set_min("0.0");
        gcode_layer_slider.set_max(&top_layer.to_string());
        gcode_layer_slider.set_value_as_number(top_layer as f64);

        info!("gcode layer slider value: {:?}", gcode_layer_slider.value_as_number());

        // Initialize Rendering
        // ----------------------------------------------------------------------------------

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
            Mat4::from_nonuniform_scale(machine_dim[0], machine_dim[1], machine_dim[2])
            * Mat4::from_angle_x(degrees(90.0))
        );

        let mut cube = Model::new_with_material(
            &context,
            &CPUMesh::cube(),
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
        cube.set_transformation(
            Mat4::from_translation(vec3(0f32, machine_dim[1], 0f32))
            * Mat4::from_nonuniform_scale(machine_dim[0], machine_dim[1], machine_dim[2])
        );

        let bounding_cube = CadBoundingBox::new_with_material(
            &context,
            cube.aabb(),
            ColorMaterial {
                color: Color {
                    r: 100,
                    g: 100,
                    b: 100,
                    a: 100,
                },
                ..Default::default()
            },
            0.5,
        )
        .unwrap();

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

                let gcode_layer_slider_val = gcode_layer_slider.value_as_number()
                    .round()
                    .max(0.0)
                    .min(gcode_transforms.len() as f64);

                let gcode_layer_slider_val = gcode_layer_slider_val as usize;

                if gcode_layer_slider_val != previous_gcode_layer_slider_val {
                    previous_gcode_layer_slider_val = gcode_layer_slider_val;
                    change = true;

                    info!("Layer: {:?}", gcode_layer_slider_val);

                    let layer_index = gcode_layer_indexes[gcode_layer_slider_val];
                    let transforms = &gcode_transforms[0..layer_index];
                        // .iter()
                        // .take_while(|(layer, _)| *layer < gcode_layer_slider_val)
                        // .map(|(_, transform)| *transform)
                        // .collect::<Vec<_>>();

                    if transforms.is_empty() {
                        gcode_model = None;
                    } else if let Some(gcode_model) = gcode_model.as_mut() {
                        gcode_model.update_transformations(transforms);
                    } else {
                        gcode_model = Some(InstancedModel::new_with_material(
                            &context,
                            transforms,
                            &cylinder,
                            wireframe_material.clone(),
                        ).unwrap());
                    };
                }

                // draw
                if change {
                    let mut scene_objects: Vec<&dyn Object> = Vec::with_capacity(5);

                    if let Some(gcode_model) = gcode_model.as_ref() {
                        scene_objects.push(gcode_model);
                    }
                    if gcode_transforms.is_empty() {
                        model.as_ref().map(|model| scene_objects.push(model));
                    }

                    scene_objects.push(&bed);
                    scene_objects.push(&bounding_cube);

                    Screen::write(
                        &context,
                        ClearState::color_and_depth(1.0, 1.0, 1.0, 1.0, 1.0),
                        || pipeline.render_pass(
                            &camera,
                            scene_objects.as_slice(),
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
}
