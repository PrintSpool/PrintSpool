use itertools::Itertools;
use serde::Deserialize;
use three_d::*;

mod cad_orbit_control;
use cad_orbit_control::CadOrbitControl;

mod cad_bounding_box;
use cad_bounding_box::CadBoundingBox;

use wasm_bindgen::{prelude::*, JsCast};

extern crate console_error_panic_hook;
use std::{panic};
use std::sync::mpsc;
use log::info;

#[cfg(target_arch = "wasm32")]
extern crate wee_alloc;

// Use `wee_alloc` as the global allocator.
#[cfg(target_arch = "wasm32")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

mod gcode_preview;
use gcode_preview::GCodePreview;

mod model_preview;
use model_preview::ModelPreview;

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

#[cfg(target_arch = "wasm32")]
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

    // let mut lines = gcode
    //     .lines()
    //     .map(|line| line);

    let renderer = Renderer::new();

    renderer.render_loop(options);

    renderer
}

pub enum Command {
    SetLayer(usize),
    SetGCode(Option<String>),
    AddModel(AddModel),
    SetRotation(SetRotation),
    Reset,
}

pub struct AddModel {
    pub file_name: String,
    pub content: Vec<u8>,
}

pub struct SetRotation {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[wasm_bindgen]
pub struct Renderer {
    tx: mpsc::Sender<Command>,
    rx: Option<mpsc::Receiver<Command>>,
}

#[wasm_bindgen]
impl Renderer {
    #[cfg(target_arch = "wasm32")]
    pub fn send(&mut self, command: &JsValue) {
        let mut command: Command = command.into_serde().expect("Invalid Renderer Command");

        self.tx.send(command).unwrap();
    }
}

impl Renderer {
    pub fn tx(&self) -> mpsc::Sender<Command> {
        self.tx.clone()
    }

    #[cfg(not(target_arch = "wasm32"))]
    pub fn send(&self, command: Command) {
        info!("Send!!");
        self.tx.send(command).unwrap();
    }

    pub fn new() -> Self {
        let (tx, rx) = mpsc::channel();

        let renderer = Self {
            tx,
            rx: Some(rx),
        };

        renderer
    }

    pub fn render_loop(
        &mut self,
        options: RenderOptions,
    ) {
        let rx = self.rx.take().expect("Render loop must only be called once");

        // let now = instant::Instant::now();
        let machine_dim = options.machine_dimensions;

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

        // Models and GCodes
        // ----------------------------------------------------------------------------------
        let mut model_preview: Option<ModelPreview> = None;
        let mut gcode_preview: Option<GCodePreview> = None;

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

        let infinite_z_bed_offset = if options.infinite_z {
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

                // Get the most recent de-duplicated commands - this allows the renderer
                // to skip redundant commands if it cannot keep up with the rate that commands are
                // sent.
                let deduplicated_commands = {
                    let mut commands = rx.try_iter()
                        .collect::<Vec<_>>();
                    // Reverse the commands so that `unique_by` returns only the latest command for
                    // each variant
                    commands.reverse();

                    // To prevent AddModel commands from being de-duplicated each command is given a
                    // unique key.
                    let mut next_add_model_key = 1024;

                    commands = commands
                        .into_iter()
                        .unique_by(|command| {
                            match command {
                                Command::SetLayer(_) => 1,
                                Command::SetGCode(_) => 2,
                                Command::SetRotation(_) => 3,
                                Command::Reset => 4,
                                Command::AddModel(_) => {
                                    next_add_model_key += 1;
                                    next_add_model_key
                                },
                            }
                        })
                        .collect::<Vec<_>>();

                    commands.reverse();
                    commands
                };

                for command in deduplicated_commands.into_iter() {
                    change = true;

                    match command {
                        Command::SetLayer(layer) => {
                            gcode_preview.as_mut().map(|gp| {
                                gp.set_layer(layer);
                            });
                        }
                        Command::AddModel(command) => {
                            model_preview = ModelPreview::parse_model(
                                command,
                                &options,
                                &context,
                            );
                        }
                        Command::SetGCode(gcode) => {
                            gcode_preview = gcode.map(|gcode| {
                                let gcode_byte_size = gcode.len();
                                let mut gcode_lines = gcode.lines();

                                GCodePreview::parse_gcodes(
                                    &mut gcode_lines,
                                    gcode_byte_size,
                                    &options,
                                    &context,
                                )
                            });
                        }
                        Command::SetRotation(command) => {
                            model_preview.as_mut().map(|mp| {
                                mp.set_rotation(command);
                            });
                        }
                        Command::Reset => {
                            model_preview = None;
                            gcode_preview = None;
                        }
                    }
                }

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

                    if let Some(gcode_preview) = gcode_preview.as_ref() {
                        if !gcode_preview.is_empty {
                            scene_objects.push(&gcode_preview.model);
                        }
                    }
                    if options.always_show_model || gcode_preview.is_none() {
                        model_preview.as_ref().map(|model_preview| {
                            scene_objects.push(&model_preview.model)
                        });
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
    }
}
