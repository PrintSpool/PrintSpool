use itertools::Itertools;
use log::warn;
use serde::{Deserialize, Serialize};
use three_d::*;

use wasm_bindgen::prelude::*;

extern crate console_error_panic_hook;
use std::{panic};
use std::sync::mpsc;

#[cfg(target_arch = "wasm32")]
extern crate wee_alloc;

// Use `wee_alloc` as the global allocator.
#[cfg(target_arch = "wasm32")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

mod export_stl;
pub use export_stl::*;

mod camera_control;
pub use camera_control::CameraPosition;

mod gcode_preview;
use gcode_preview::{GCodePreview, GCodeSummary, GCodePreviewWithModel};

mod model_preview;
use model_preview::{ModelPreview, ModelPreviewWithModel, ModelSummary};

#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RenderOptions {
    pub machine_dimensions: Vec3,
    #[serde(rename="infiniteZ", default)]
    pub infinite_z: bool,
    #[serde(default)]
    pub invert_rotation: AxisBools,
}


#[derive(Default, Deserialize, Clone)]
pub struct AxisBools {
    pub x: bool,
    pub y: bool,
    pub z: bool,
}

impl AxisBools {
    pub fn to_vec3(&self) -> Vec3 {
        Vec3::new(
            if self.x { -1.0 } else { 1.0 },
            if self.y { -1.0 } else { 1.0 },
            if self.z { -1.0 } else { 1.0 },
        )
    }
}

impl RenderOptions {
    pub fn bed_center(&self) -> Vec3 {
        let mut bed_center = self.machine_dimensions / 2.0;
        // The center of the bed is at Z = 0
        bed_center.z = 0.0;

        bed_center
    }
}

#[wasm_bindgen(js_name = start)]
pub fn start_wasm(
    options: &JsValue,
    on_change: js_sys::Function,
) -> Renderer {
    console_log::init_with_level(log::Level::Debug)
        .expect("Error initializing logging");
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let options: RenderOptions = options.into_serde().expect("Invalid RenderOptions");

    let mut renderer = Renderer::new(options);

    renderer.render_loop(move |event| {
        // Relay model transformation changes to JS
        let _ = on_change.call1(
            &JsValue::UNDEFINED,
            &JsValue::from_serde(&event).unwrap(),
        ).map_err(|err| warn!("Error in onChange Callback: {:?}", err));
    });

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
    SetModelRotation(AxesInput),
    SetModelPosition(AxesInput),
    SetModelScale(AxesInput),
    SetModelMirroring(SetModelMirroring),
    SetCameraPosition(CameraPosition),
    SetSpinMode(bool),
    UpdateCameraTarget,
    SetViewMode(ViewMode),
    Reset,
    Exit,
}

#[derive(Deserialize, Default)]
pub struct AxesInput {
    pub x: Option<f32>,
    pub y: Option<f32>,
    pub z: Option<f32>,
}

#[derive(Deserialize, Default)]
pub struct SetModelMirroring {
    pub x: Option<bool>,
    pub y: Option<bool>,
    pub z: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
#[serde(rename_all = "camelCase")]
pub enum ViewMode {
    #[serde(rename = "gcode")]
    GCode,
    Model,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase", tag = "type")]
pub enum Event {
    Transform(Transform),
    GCodeLoaded,
    ViewModeChange { value: ViewMode },
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Transform {
    pub source: TransformSource,
    pub mat4: Mat4,
    pub position: Vec3,
    pub scale: Vec3,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum TransformSource {
    ModelLoaded,
    WebGLInput,
    ExternalInput,
}

impl AxesInput {
    pub fn override_vec3(&self, v: Vec3) -> Vec3 {
        Vec3::new(
            self.x.unwrap_or(v.x),
            self.y.unwrap_or(v.y),
            self.z.unwrap_or(v.z),
        )
    }
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
    pub fn add_model_wasm(
        &mut self,
        file_name: String,
        content: Vec<u8>,
    ) -> JsValue {
        let model_summary = self.add_model(file_name, content);

        JsValue::from_serde(&model_summary).unwrap()
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
        self.tx.send(command).unwrap();
    }

    pub fn add_model(
        &mut self,
        file_name: String,
        content: Vec<u8>,
    ) -> ModelSummary {
        let model_preview = ModelPreview::parse_model(
            file_name,
            content,
            &self.options,
        );

        let summary = model_preview.summary();

        self.send(Command::AddModel(model_preview));

        summary
    }

    pub fn new(
        mut options: RenderOptions,
    ) -> Self {
        let (tx, rx) = mpsc::channel();

        if options.infinite_z {
            // Y and Z axes are swapped in infinite Z printers
            let dim = options.machine_dimensions;
            options.machine_dimensions = Vec3::new(dim.x, dim.z, dim.y);
        }

        let renderer = Self {
            tx,
            rx: Some(rx),
            options,
        };

        renderer
    }

    pub fn render_loop<F>(
        &mut self,
        event_listener: F,
    )
    where
        F: Fn(Event) + 'static,
    {
        let rx = self.rx.take().expect("Render loop must only be called once");
        let options = self.options.clone();

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

        let mut sorted_dimensions = vec![machine_dim[0], machine_dim[1], machine_dim[2]];
        sorted_dimensions.sort_by(|a, b| a.partial_cmp(b).unwrap());

        let median_dim = sorted_dimensions[1];
        let max_dim = sorted_dimensions[2];

        let mut camera_control = camera_control::CameraPositionControl::new(
            options.clone(),
            median_dim,
            1.0,
        max_dim * 20.0,
            &window,
            &context,
        );

        // Models and GCodes
        // ----------------------------------------------------------------------------------
        let mut model_preview: Option<ModelPreviewWithModel> = None;
        let mut gcode_preview: Option<GCodePreviewWithModel> = None;
        let mut spin_mode_enabled = false;

        // Initialize Rendering
        // ----------------------------------------------------------------------------------

        let axis_indicator_length = 10.0;
        let mut x_axis_indicator = Model::new_with_material(
            &context,
            &CPUMesh::cube(),
            PhysicalMaterial {
                albedo: Color {
                    r: 255,
                    g: 0,
                    b: 0,
                    a: 100,
                },
                ..Default::default()
            },
        )
        .unwrap();


        x_axis_indicator.set_transformation(1.0
            * Mat4::from_translation(vec3(
                -machine_dim.x/2.0 + axis_indicator_length,
                if options.infinite_z { 0.0 } else { -machine_dim.y/2.0 },
                0.0,
            ))
            * Mat4::from_nonuniform_scale(axis_indicator_length, 1.0, 1.0)
        );


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

        let mut bed_transform = Mat4::from_nonuniform_scale(
            machine_dim.x / 2.0,
            machine_dim.y / 2.0,
            machine_dim.z / 2.0,
        );

        if options.infinite_z {
            bed_transform = 1.0
                * Mat4::from_translation(vec3(0.0, machine_dim.y / 2.0, 0.0))
                * bed_transform;
        }

        bed.set_transformation(bed_transform);

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
        cube.set_transformation(1.0
            * Mat4::from_translation(vec3(0.0, 0.0, machine_dim[2] / 2.0))
            * bed_transform
        );

        let bounding_cube = BoundingBox::new_with_material_and_thickness(
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

        let ambient_light = AmbientLight {
            intensity: 0.4,
            color: Color::WHITE,
            ..Default::default()
        };
        let directional_lights = vec![
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
                &vec3(1.0, 1.0, -1.0),
            )
            .unwrap(),
            DirectionalLight::new(
                &context,
                1.0,
                Color::WHITE,
                &vec3(0.0, 0.0, 1.0),
            )
            .unwrap(),
        ];

        let mut view_mode = ViewMode::Model;

        // main loop
        window
            .render_loop(move |mut frame_input| {
                let mut change = frame_input.first_frame;
                change |= camera_control.camera.set_viewport(frame_input.viewport).unwrap();

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
                                Command::SetModelRotation(_) => 201,
                                Command::SetModelPosition(_) => 202,
                                Command::SetModelScale(_) => 203,
                                Command::SetModelMirroring(_) => 204,
                                Command::SetCameraPosition(_) => 301,
                                Command::UpdateCameraTarget => 302,
                                Command::SetViewMode(_) => 303,
                                Command::SetSpinMode(_) => 304,
                                Command::Reset => 401,
                                Command::Exit => 402,
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

                let mut external_model_transformation = false;
                for command in deduplicated_commands.into_iter() {
                    change = true;

                    match command {
                        Command::SetLayer(layer) => {
                            gcode_preview.as_mut().map(|gp| {
                                gp.set_layer(layer);
                            });
                        }
                        Command::AddModel(next_model_preview) => {
                            let mp = next_model_preview.with_model(&context);
                            // Update the camera target
                            camera_control.set_target(Some(mp.model.aabb()));
                            // Notify event listeners
                            event_listener(mp.transform_event(
                                TransformSource::ModelLoaded
                            ));
                            model_preview = Some(mp);
                            view_mode = ViewMode::Model;
                            event_listener(Event::ViewModeChange { value: view_mode.clone() })
                        }
                        Command::SetGCode(next_gcode_preview) => {
                            // Load the gcode
                            gcode_preview = next_gcode_preview.map(|gp| {
                                let gp = gp.with_model(&context);
                                // Notify event listeners
                                event_listener(Event::GCodeLoaded);
                                gp
                            });

                            // Set the view mode to GCode or if the GCode is being cleared set the
                            // view mode to Model
                            view_mode = gcode_preview
                                .as_ref()
                                .map(|_| ViewMode::GCode)
                                .unwrap_or(ViewMode::Model);

                            event_listener(Event::ViewModeChange { value: view_mode.clone() })
                        }
                        Command::SetModelPosition(position) => {
                            model_preview.as_mut().map(|mp| {
                                mp.position = position.override_vec3(mp.position);
                                external_model_transformation = true;
                            });
                        }
                        Command::SetModelRotation(rotation) => {
                            model_preview.as_mut().map(|mp| {
                                mp.rotation = rotation.override_vec3(mp.rotation);
                                external_model_transformation = true;
                            });
                        }
                        Command::SetModelScale(scale) => {
                            model_preview.as_mut().map(|mp| {
                                mp.scale = scale.override_vec3(mp.scale);
                                mp.center();
                                external_model_transformation = true;
                            });
                        }
                        Command::SetModelMirroring(mirror) => {
                            model_preview.as_mut().map(|mp| {
                                mp.set_mirror(mirror, &context);
                                external_model_transformation = true;
                            });
                        }
                        Command::SetCameraPosition(camera_position) => {
                            camera_control.apply_position(camera_position);
                        }
                        Command::UpdateCameraTarget => {
                            // Update the camera target
                            let target_aabb = None
                                .or(gcode_preview.as_ref().map(|gp| gp.model.aabb()))
                                .or(model_preview.as_ref().map(|mp| mp.model.aabb()));
                            camera_control.set_target(target_aabb);
                            if spin_mode_enabled {
                                camera_control.set_spin_start_position();
                            }
                        }
                        Command::SetSpinMode(enable) => {
                            spin_mode_enabled = enable;
                            camera_control.set_spin_start_position();
                        },
                        Command::SetViewMode(next_view_mode) => {
                            spin_mode_enabled = false;
                            view_mode = next_view_mode;
                            event_listener(Event::ViewModeChange { value: view_mode.clone() })
                        },
                        Command::Reset => {
                            model_preview = None;
                            gcode_preview = None;
                        }
                        Command::Exit => {
                            return FrameOutput {
                                exit: true,
                                ..Default::default()
                            };
                        }
                    }
                }

                if external_model_transformation {
                    gcode_preview = None;
                    model_preview.as_mut().map(|mp| {
                        mp.update_transform();
                        camera_control.set_target(Some(mp.model.aabb()));

                        event_listener(mp.transform_event(
                            TransformSource::ExternalInput
                        ));
                    });
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

                change |= camera_control
                    .handle_events(&mut frame_input.events)
                    .unwrap();

                change |= spin_mode_enabled;

                if spin_mode_enabled {
                    camera_control.increment_spin(frame_input.elapsed_time).unwrap();
                }

                // draw
                if change {
                    let mut scene_objects: Vec<&dyn Object> = Vec::with_capacity(5);

                    match (
                        &view_mode,
                        gcode_preview.as_ref().filter(|gp| !gp.is_empty),
                        model_preview.as_ref(),
                    ) {
                        | (ViewMode::GCode, Some(gcode_preview), _)
                        | (ViewMode::Model, Some(gcode_preview), None)
                        => {
                                scene_objects.push(&gcode_preview.model)
                        }
                        | (ViewMode::Model, _, Some(model_preview))
                        | (ViewMode::GCode, None, Some(model_preview))
                        => {
                            scene_objects.push(&model_preview.model)
                        },
                        _ => {}
                    }

                    if !spin_mode_enabled {
                        scene_objects.push(&x_axis_indicator);
                        scene_objects.push(&bed);
                        scene_objects.push(&bounding_cube);
                    }

                    let mut lights: Vec<&dyn Light> = directional_lights
                        .iter()
                        .map(|light| light as &dyn Light)
                        .collect::<Vec<_>>();
                    lights.push(&ambient_light);

                    Screen::write(
                        &context,
                        ClearState::color_and_depth(1.0, 1.0, 1.0, 1.0, 1.0),
                        || pipeline.render_pass(
                            &camera_control.camera,
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
