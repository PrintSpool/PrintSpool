use serde::Deserialize;
use three_d::*;

mod cad_orbit_control;
use cad_orbit_control::CadOrbitControl;

mod cad_bounding_box;
use cad_bounding_box::CadBoundingBox;

use wasm_bindgen::{prelude::*, JsCast};

extern crate console_error_panic_hook;
use std::{panic, io::Cursor};
use log::info;

#[cfg(target_arch = "wasm32")]
extern crate wee_alloc;

// Use `wee_alloc` as the global allocator.
#[cfg(target_arch = "wasm32")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

mod gcode_preview;
use gcode_preview::GCodePreview;

#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RenderOptions {
    pub file_names: Vec<String>,
    pub machine_dimensions: Vec3,
    #[serde(rename="infiniteZ")]
    pub infinite_z: bool,
    #[serde(default)]
    pub always_show_model: bool,
}

impl RenderOptions {
    pub fn bed_center(&self) -> Vec3 {
        let mut bed_center = self.machine_dimensions / 2.0;
        // The center of the bed is at Z = 0
        bed_center[1] = 0.0;

        bed_center
    }
}

#[wasm_bindgen]
pub struct Renderer {
    options: RenderOptions,
}

#[wasm_bindgen]
pub fn render_string(
    model: &[u8],
    gcode: Option<String>,
    options: &JsValue,
) -> Renderer {
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

    let mut renderer = Renderer::new(options);

    renderer.start(
        Some(model),
        &mut lines,
        gcode.len(),
    );

    renderer
}

#[wasm_bindgen]
impl Renderer {
    pub fn set_gcode(&mut self, gcode: Option<String>) {

    }
}

impl Renderer {
    pub fn new(options: RenderOptions) -> Self {
        Self { options }
    }

    pub fn start(
        &mut self,
        model: Option<&[u8]>,
        gcode_lines: &mut dyn Iterator<Item = &str>,
        gcode_byte_size: usize,
    ) {
        // let now = instant::Instant::now();
        let machine_dim = self.options.machine_dimensions;

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
            vec3(-max_dim * 2.0, max_dim * 2.0, -max_dim * 2.5),
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
            info!("GCode Size: {:?}MB", gcode_byte_size / 1_000_000);

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
                let min_z = verticies.iter().map(|v| v[2]).reduce(f32::min).unwrap_or(0f32);

                let mut min = [f32::MAX; 2];
                let mut max = [f32::MIN; 2];
                for v in &verticies {
                    for (i, (val, min)) in v[0..2].iter().zip(min.iter_mut()).enumerate() {
                        if
                            val < min
                            // Center Infinite Z models only on the y depth of their bottom layer
                            && (
                                !self.options.infinite_z
                                || v[2] == min_z
                                || i != 1
                            )
                        {
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
                    // Non-Infinite Z: Centering the model on x = 0, y = 0 (in CAD coordinates)
                    // Infinite Z: Positioning at [X: center, Y: min]
                    .map(|v| {
                        let y_offset = if self.options.infinite_z {
                            min[1]
                        } else {
                            -center[1]
                        };

                        return [
                            v[0] - center[0],
                            v[1] + y_offset,
                            v[2],
                        ]
                    })
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

        // Load GCodes
        // ----------------------------------------------------------------------------------
        let options = self.options.clone();
        let mut gcode_preview = GCodePreview::parse_gcodes(
            gcode_lines,
            gcode_byte_size,
            &options,
            &context,
        );

        // DOM Inputs
        // ----------------------------------------------------------------------------------
        #[cfg(target_arch = "wasm32")]
        let gcode_layer_slider = {
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
            gcode_layer_slider.set_max(&gcode_preview.top_layer.to_string());
            gcode_layer_slider.set_value_as_number(gcode_preview.top_layer as f64);

            info!("gcode layer slider value: {:?}", gcode_layer_slider.value_as_number());

            gcode_layer_slider
        };

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

        let infinite_z_bed_offset = if self.options.infinite_z {
            machine_dim[2]
        } else {
            0f32
        };

        bed.set_transformation(
            Mat4::from_translation(vec3(0f32, 0f32, infinite_z_bed_offset))
            * Mat4::from_nonuniform_scale(machine_dim[0], machine_dim[1], machine_dim[2])
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
            Mat4::from_translation(vec3(0f32, machine_dim[1], infinite_z_bed_offset))
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

                #[cfg(target_arch = "wasm32")]
                {
                    let gcode_layer_slider_val = gcode_layer_slider.value_as_number()
                        .round()
                        .max(0.0)
                        .min(gcode_preview.transforms.len() as f64);

                    let gcode_layer_slider_val = gcode_layer_slider_val as usize;

                    if gcode_layer_slider_val != previous_gcode_layer_slider_val {
                        previous_gcode_layer_slider_val = gcode_layer_slider_val;
                        change = true;

                        info!("Layer: {:?}", gcode_layer_slider_val);

                        gcode_preview.set_layer(gcode_layer_slider_val, &context);
                    }
                }

                // draw
                if change {
                    let mut scene_objects: Vec<&dyn Object> = Vec::with_capacity(5);

                    if let Some(gcode_model) = gcode_preview.model.as_ref() {
                        scene_objects.push(gcode_model);
                    }
                    if options.always_show_model || gcode_preview.transforms.is_empty() {
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
