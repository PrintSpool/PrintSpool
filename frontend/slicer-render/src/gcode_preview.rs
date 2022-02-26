use std::{ops::{Deref, DerefMut}, mem};

use itertools::Itertools;
use nom_gcode::{GCode, GCodeLine, Mnemonic, Comment};
use log::{warn, info, trace};
use three_d::*;
use wasm_bindgen::prelude::*;

use crate::RenderOptions;

pub struct Layer {
    model_instance_index: usize,
    min_y: f32,
}

pub struct GCodePreview {
    pub top_layer: usize,
    pub layers: Vec<Layer>,
    pub model_instances: Vec<ModelInstance>,
    pub is_empty: bool,
    options: RenderOptions,
}

pub struct GCodePreviewWithModel {
    inner: GCodePreview,
    pub model: InstancedModel<PhysicalMaterial>,
}

struct GCodeParserState {
    position: Vec3,
    relative_movement: bool,
}

#[derive(Copy, Clone)]
struct GCodePoint {
    layer_index: usize,
    position: Vec3,
    is_extrude: bool,
}

#[wasm_bindgen]
pub struct GCodeSummary {
    #[wasm_bindgen(js_name = topLayer)]
    pub top_layer: usize,
}

impl GCodePreview {
    pub fn parse_gcodes(
        gcode: &str,
        options: &RenderOptions,
    ) -> (GCodeSummary, Self) {

        let now = instant::Instant::now();
        let mut gcode_count = 0;

        let gcode_byte_size = gcode.len();
        let gcode_lines = gcode.lines();

        info!("GCode Size: {:?}MB", gcode_byte_size / 1_000_000);

        let mut layers = Vec::with_capacity(100);
        layers.push(Layer {
            model_instance_index: 0usize,
            min_y: 0.0,
        });

        let mut state: GCodeParserState = GCodeParserState {
            position: Vec3::new(0.0, 0.0, 0.0),
            relative_movement: false,
        };

        let mut previous_layer_z = 0f32;
        let mut top_layer = 0usize;
        let mut priming_extruder = false;

        let positions = gcode_lines.flat_map(|line| {
            gcode_count += 1;

            let (_, gcode) = nom_gcode::parse_gcode(&line)
                .expect("Error parsing gcode");

            let gcode = match gcode {
                // Doc Comments
                Some(GCodeLine::DocComment(doc_comment)) => {
                    info!("GCode Doc Comment: {:?}", doc_comment);
                    return None
                }
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
                    trace!("G28:  {:?}", gcode.to_string());
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
                        trace!("G92:  {:?}", gcode.to_string());
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
                // Some(GCodeLine::Comment(Comment(comment))) => {
                //     info!("Comment: {:?}", comment);
                //     return None;
                // }
                Some(GCodeLine::Comment(Comment(comment))) if comment.starts_with("Prime") => {
                    info!("Extruder priming detected: {:?}", comment);
                    priming_extruder = true;
                    return None
                }
                _ => return None,
            };

            let mut is_extrude = false;
            gcode.arguments().for_each(|(k, v)| {
                let index = match k {
                    'X' => 0,
                    'Y' => 1,
                    'Z' => 2,
                    // Incrementing the layer when an extruder is done on a new z-plane
                    'E' if v.map(|v| v > 0.0).unwrap_or(false) => {
                        if priming_extruder {
                            priming_extruder = false;
                            return ()
                        }

                        is_extrude = true;
                        if previous_layer_z != state.position[1] {
                            previous_layer_z = state.position[1];
                            top_layer += 1;
                        }
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

            let gcode_position = if options.infinite_z {
                let y_angle = 45_f32.to_radians();
                // state.position ordering: (X, Y, Z)
                // Y and Z need to be swapped and Y needs to rotated forward
                // by 45 degrees to render infinite z printer gcodes correctly.
                Vec3::new(
                    state.position[0],
                    - state.position[2] + y_angle.sin() * state.position[1],
                    y_angle.cos() * state.position[1],
                )
            } else {
                state.position.clone()
            };

            Some(GCodePoint {
                layer_index: top_layer,
                position: gcode_position,
                is_extrude,
            })
        });

        let gcode_bed_center = if options.infinite_z {
            Vec3::new(options.bed_center().x, 0f32, 0f32)
        } else {
            options.bed_center()
        };

        let mut min_layer_y = f32::INFINITY;
        let model_instances = positions
            .enumerate()
            .tuple_windows()
            .map(|((_i1, point1), (i2, point2))| {
                let GCodePoint {
                    layer_index: l1,
                    position: p1,
                    ..
                } = point1;

                let GCodePoint {
                    layer_index: l2,
                    position: p2,
                    is_extrude,
                } = point2;

                let scale = Mat4::from_nonuniform_scale(
                    (p1 - p2).magnitude(),
                    1.0,
                    1.0
                );
                let rotation = rotation_matrix_from_dir_to_dir(
                    vec3(1.0, 0.0, 0.0),
                    (p2 - p1).normalize(),
                );
                let translation = Mat4::from_translation(p1 - gcode_bed_center);

                // Max layer y is used to realistically translate infinite z prints along the belt
                // when previewing it's layers
                //
                // Intentionally skipping the first point since it is often a homing which throws
                // off infinite z belt positioning in the rendering.
                if p2.y < min_layer_y && is_extrude {
                    min_layer_y = p1.y;
                }
                // info!("Y: {:?}", p1.y);

                // Store the layer indexes seperately so that this vec can be sliced and used
                // without allocation on layer selection to update the model
                if l1 != l2 {
                    layers.push(Layer {
                        model_instance_index: i2,
                        min_y: if min_layer_y.is_finite() { min_layer_y } else { 0.0 },
                    });
                    // min_layer_y = f32::INFINITY;
                }

                ModelInstance {
                    geometry_transform: translation * rotation * scale,
                    ..Default::default()
                }
            })
            .collect::<Vec<_>>();
            // .group_by(|(layer, _)| *layer)

        if model_instances.is_empty() {
            warn!("No printable GCode layers found!");
        } else {
            info!(
                "{} GCodes ({:.1}MB) sliced in {}ms",
                gcode_count,
                (gcode_byte_size as f64 / 1_000_000f64),
                now.elapsed().as_millis(),
            );
        };

        let gcode_preview = Self {
            top_layer,
            layers,
            model_instances,
            is_empty: false,
            options: options.clone(),
        };

        let gcode_summary = GCodeSummary {
            top_layer,
        };

        (gcode_summary, gcode_preview)
    }

    pub fn with_model(
        self,
        context: &Context,
    ) -> GCodePreviewWithModel {
        let mut cylinder = CPUMesh::cylinder(3);
        cylinder.transform(&Mat4::from_nonuniform_scale(1.0, 0.3, 0.3));

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

        let model = InstancedModel::new_with_material(
            &context,
            &self.model_instances,
            &cylinder,
            wireframe_material.clone(),
        ).unwrap();

        let mut preview_with_model = GCodePreviewWithModel {
            inner: self,
            model,
        };

        // Transform the model by it's top layer y offset
        preview_with_model.update_z_offset(preview_with_model.top_layer);

        preview_with_model
    }
}

impl Deref for GCodePreviewWithModel {
    type Target = GCodePreview;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl DerefMut for GCodePreviewWithModel {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.inner
    }
}

impl GCodePreviewWithModel {
    pub fn set_layer(&mut self, mut layer_index: usize) {
        let top_layer = self.layers.len();
        if layer_index < 1 {
            warn!("Layer ({}) cannot be less then 1. Defaulting to bottom layer", layer_index);
            layer_index = 1;
        };

        if layer_index > top_layer {
            warn!("Layer {} does not exist. Defaulting to top layer ({})", layer_index, top_layer);
            layer_index = top_layer;
        };

        let Layer {
            model_instance_index,
            ..
        } = self.layers[layer_index];
        self.is_empty = model_instance_index <= 1;

        if self.is_empty {
            return
        }

        let model_instances = mem::take(&mut self.model_instances);

        // self.model.set_instances(&model_instances[0..model_instance_index]);
        self.model.show_instances(model_instance_index);

        self.update_z_offset(layer_index);

        self.model_instances = model_instances;
    }

    fn update_z_offset(&mut self, layer_index: usize) {
        if self.options.infinite_z {
            let Layer {
                min_y,
                ..
            } = self.layers[layer_index];

            self.model.set_transformation(
                Mat4::from_translation(-Vec3::unit_y() * min_y),
            );
        }
    }
}
