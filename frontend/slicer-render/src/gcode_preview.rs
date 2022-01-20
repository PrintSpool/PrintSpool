use std::{ops::{Deref, DerefMut}, mem};

use itertools::Itertools;
use nom_gcode::{GCode, GCodeLine, Mnemonic};
use log::{warn, info, trace};
use three_d::*;
use wasm_bindgen::prelude::*;

use crate::RenderOptions;

pub struct GCodePreview {
    pub top_layer: usize,
    pub layer_indexes: Vec<usize>,
    pub transforms: Vec<Mat4>,
    pub is_empty: bool,
}

pub struct GCodePreviewWithModel {
    inner: GCodePreview,
    pub model: InstancedModel<PhysicalMaterial>,
}

struct GCodeParserState {
    position: Vec3,
    relative_movement: bool,
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

        let mut layer_indexes = Vec::with_capacity(100);
        layer_indexes.push(0usize);

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

            let gcode_position = if options.infinite_z {
                let y_angle = 45_f32.to_radians();
                // state.position ordering: (X, Z, Y)
                // Y and Z need to be swapped again and Y needs to rotated forward
                // by 45 degrees to render infinite z printer gcodes correctly.
                Vec3::new(
                    state.position[0],
                    y_angle.cos() * state.position[2],
                    state.position[1] - y_angle.sin() * state.position[2],
                )
            } else {
                state.position.clone()
            };

            Some((top_layer, gcode_position))
        });

        let gcode_bed_center = if options.infinite_z {
            Vec3::new(options.bed_center().x, 0f32, 0f32)
        } else {
            options.bed_center()
        };

        let transforms = positions
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
                let translation = Mat4::from_translation(p1 - gcode_bed_center);

                // Store the layer indexes seperately so that this vec can be sliced and used
                // without allocation on layer selection to update the model
                if l1 != l2 {
                    layer_indexes.push(i2)
                }

                translation * rotation * scale
            })
            .collect::<Vec<_>>();
            // .group_by(|(layer, _)| *layer)

        if transforms.is_empty() {
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
            layer_indexes,
            transforms,
            is_empty: false,
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
            &self.transforms,
            &cylinder,
            wireframe_material.clone(),
        ).unwrap();

        GCodePreviewWithModel {
            inner: self,
            model,
        }
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
    pub fn set_layer(&mut self, mut layer: usize) {
        let top_layer = self.layer_indexes.len();
        if layer < 1 {
            warn!("Layer ({}) cannot be less then 1. Defaulting to bottom layer", layer);
            layer = 1;
        };

        if layer >= top_layer {
            warn!("Layer {} does not exist. Defaulting to top layer ({})", layer, top_layer);
            layer = top_layer;
        };

        let layer_index = self.layer_indexes[layer];
        self.is_empty = layer_index <= 1;

        if self.is_empty {
            return
        }

        let transforms = mem::take(&mut self.transforms);

        self.model.update_transformations(&transforms[0..layer_index]);

        self.transforms = transforms;
    }
}
