use itertools::Itertools;
use serde::Deserialize;
use three_d::*;

mod cad_orbit_control;
use cad_orbit_control::CadOrbitControl;

mod cad_bounding_box;
use cad_bounding_box::CadBoundingBox;

use wasm_bindgen::prelude::*;

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
use gcode_preview::{GCodePreview, GCodeSummary, GCodePreviewWithModel};

mod model_preview;
use model_preview::{ModelPreview, ModelPreviewWithModel};

#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RenderOptions {
    pub machine_dimensions: Vec3,
    #[serde(rename="infiniteZ")]
    pub infinite_z: bool,
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
pub fn start(
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
    // let gcode = gcode.unwrap_or("".into());

    // let mut lines = gcode
    //     .lines()
    //     .map(|line| line);

    let mut renderer = Renderer::new(options);

    renderer.render_loop();

    renderer
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Command {
    SetLayer(usize),
    #[serde(skip)]
    SetGCode(Option<GCodePreview>),
    #[serde(skip)]
    AddModel(ModelPreview),
    SetRotation(Vec3),
    SetPosition(Vec3),
    Reset,
}

#[wasm_bindgen]
pub struct Renderer {
    tx: mpsc::Sender<Command>,
    rx: Option<mpsc::Receiver<Command>>,
    options: RenderOptions,
}

#[wasm_bindgen]
impl Renderer {
    #[wasm_bindgen(js_name = addModel)]
    pub fn add_model(
        &mut self,
        file_name: String,
        content: Vec<u8>,
    ) {
        let model_preview = ModelPreview::parse_model(
            file_name,
            content,
            &self.options,
        );

        self.send(Command::AddModel(model_preview));
    }

    #[wasm_bindgen(js_name = setGCode)]
    pub fn set_gcode(&mut self, gcode: String) -> GCodeSummary {
        let (
            gcode_summary,
            gcode_preview,
        ) = GCodePreview::parse_gcodes(&gcode, &self.options);

        self.send(Command::SetGCode(Some(gcode_preview)));

        gcode_summary
    }

    #[wasm_bindgen(js_name = clearGCode)]
    pub fn clear_gcode(&mut self) {
        self.send(Command::SetGCode(None));
    }

    #[wasm_bindgen(js_name = send)]
    pub fn send_wasm(&mut self, command: &JsValue) {
        self.send(command.into_serde().expect("Invalid Renderer Command"));
    }
}

impl Renderer {
    pub fn tx(&self) -> mpsc::Sender<Command> {
        self.tx.clone()
    }

    pub fn send(&self, command: Command) {
        info!("Send!!");
        self.tx.send(command).unwrap();
    }

    pub fn new(options: RenderOptions) -> Self {
        let (tx, rx) = mpsc::channel();

        let renderer = Self {
            tx,
            rx: Some(rx),
            options,
        };

        renderer
    }

    pub fn render_loop(
        &mut self,
    ) {
        let rx = self.rx.take().expect("Render loop must only be called once");

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

        // Models and GCodes
        // ----------------------------------------------------------------------------------
        let mut model_preview: Option<ModelPreviewWithModel> = None;
        let mut gcode_preview: Option<GCodePreviewWithModel> = None;

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
                                Command::SetLayer(_) => 101,
                                Command::SetGCode(_) => 102,
                                Command::SetRotation(_) => 201,
                                Command::SetPosition(_) => 202,
                                Command::Reset => 301,
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
                        Command::AddModel(next_model_preview) => {
                            model_preview = Some(next_model_preview.with_model(&context));
                        }
                        Command::SetGCode(next_gcode_preview) => {
                            gcode_preview = next_gcode_preview.map(|p| {
                                p.with_model(&context)
                            });
                        }
                        Command::SetPosition(position) => {
                            model_preview.as_mut().map(|mp| {
                                mp.position = position;
                                mp.update_transform();
                            });
                        }
                        Command::SetRotation(rotation) => {
                            model_preview.as_mut().map(|mp| {
                                mp.rotation = rotation;
                                mp.update_transform();
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

                // draw
                if change {
                    let mut scene_objects: Vec<&dyn Object> = Vec::with_capacity(5);

                    if let Some(gcode_preview) = gcode_preview.as_ref() {
                        if !gcode_preview.is_empty {
                            scene_objects.push(&gcode_preview.model);
                        }
                    }
                    if gcode_preview.is_none() {
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
