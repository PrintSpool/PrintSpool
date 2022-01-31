use log::{info};
use serde::{Serialize};
use three_d::*;
use std::{panic, io::Cursor, ops::{Deref, DerefMut}};
use crate::RenderOptions;

pub struct ModelPreview {
    cpu_mesh: CPUMesh,
    pub position: Vec3,
    position_offset: Vec3,
    pub rotation: Vec3,
    pub scale: Vec3,
    pub mirror: Mirror,
    min: [f32; 3],
    max: [f32; 3],
    center: Vec3,
    infinite_z: bool,
}

#[derive(Default)]
pub struct Mirror {
    pub x: bool,
    pub y: bool,
    pub z: bool,
}

impl Mirror {
    pub fn to_vec3(&self) -> Vec3 {
        Vec3::new(
            if self.x { -1.0 } else { 1.0 },
            if self.y { -1.0 } else { 1.0 },
            if self.z { -1.0 } else { 1.0 },
        )
    }
}

#[derive(Serialize)]
pub struct ModelSummary {
    pub size: Vec3,
}

pub struct ModelPreviewWithModel {
    inner: ModelPreview,
    pub model: Model<PhysicalMaterial>,
}

impl ModelPreview {
    pub fn parse_model(
        file_name: String,
        content: Vec<u8>,
        options: &RenderOptions,
    ) -> Self {
        let now = instant::Instant::now();

        let model_bytes = content.len();

        if content.is_empty() {
            panic!("Nothing to display")
        }

        info!("Model ({:?}) Size: {:.2}MB", file_name, (model_bytes as f64) / 1_000_000.0);

        let (
            cpu_mesh,
            min,
            max,
            center
        ) = if file_name.to_ascii_lowercase().ends_with(".stl") {
            let mut reader = Cursor::new(&content[..]);
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
            let mut min = [f32::MAX; 3];
            let mut max = [f32::MIN; 3];
            const ROUNDING: f32 = 0.01;

            let min_z = verticies.iter().map(|v| v[2]).reduce(f32::min).unwrap_or(0f32);
            min[2] = min_z;

            for v in &verticies {
                for (i, (val, min)) in v[0..2].iter().zip(min.iter_mut()).enumerate() {
                    if
                        val < min
                        // Center Infinite Z models only on the y depth of their bottom layer
                        && (
                            !options.infinite_z
                            || v[2] < min_z + ROUNDING
                            || i != 1
                        )
                    {
                        *min = *val
                    }
                }
                for (i, (val, max)) in v[0..3].iter().zip(max.iter_mut()).enumerate() {
                    if
                        val > max
                        // Center Infinite Z models only on the y depth of their bottom layer
                        && (
                            !options.infinite_z
                            || v[2] < min_z + ROUNDING
                            || i != 1
                        )
                    {
                        *max = *val
                    }
                }
            }

            let center = min.iter()
                .zip(max.iter())
                .map(|(min, max)| (min + max) / 2f32)
                .collect::<Vec<_>>();

            let center = Vec3::new(center[0], center[1], center[2]);

            info!("GCode Min: {:?} Max: {:?} Center {:?}", min, max, center);

            let positions = verticies
                .into_iter()
                // Non-Infinite Z: Centering the model on x = 0, y = 0 (in CAD coordinates)
                // Infinite Z: Positioning at [X: center, Y: min]
                // .map(|v| {
                //     let y_offset = if options.infinite_z {
                //         min[1]
                //     } else {
                //         -center[1]
                //     };

                //     return [
                //         v[0] - center[0],
                //         v[1] + y_offset,
                //         v[2],
                //     ]
                // })
                .flatten()
                .map(|v| *v)
                .collect::<Vec<f32>>();

            let normals = mesh.triangles()
                .into_iter()
                .map(|t| [t.normal(), t.normal(), t.normal()])
                .flatten()
                // .map(|t| t.normal())
                .map(|v| [v[0], v[1], v[2]])
                .flatten()
                .collect::<Vec<f32>>();

            let mut cpu_mesh = CPUMesh {
                positions,
                normals: Some(normals),
                ..Default::default()
            };

            let transform = 1.0
                // 1. Center the model
                * Mat4::from_translation(-center);

            cpu_mesh.transform(&transform);


            (cpu_mesh, min, max, center)
        } else {
            panic!("Only .stl files are supported for now");
        };

        info!("Parsed STL model ({:.1}MB) in {}ms", (model_bytes as f64 / 1_000_000f64), now.elapsed().as_millis());

        let model_preview = Self {
            cpu_mesh,
            position: Vec3::zero(),
            position_offset: Vec3::zero(),
            rotation: Vec3::zero(),
            scale: Vec3::new(1.0, 1.0, 1.0),
            mirror: Default::default(),
            min,
            max,
            center,
            infinite_z: options.infinite_z,
        };

        model_preview
    }

    pub fn create_model(
        &self,
        context: &Context,
    ) -> Model<PhysicalMaterial> {
        let model_material = PhysicalMaterial {
            name: "cad-model".to_string(),
            albedo: Color::new_opaque(255, 255, 255),
            roughness: 0.7,
            metallic: 0.9,
            opaque_render_states: RenderStates {
                // Cull none allow users to flip the model without having to invert the normals
                cull: Cull::None,
                ..Default::default()
            },
            ..Default::default()
        };

        let model = Model::new_with_material(
            &context,
            &self.cpu_mesh,
            model_material,
        )
            .unwrap();

        model
    }

    pub fn with_model(
        self,
        context: &Context,
    ) -> ModelPreviewWithModel {
        let model =  self.create_model(&context);

        let mut model_preview = ModelPreviewWithModel {
            inner: self,
            model,
        };

        model_preview.center();
        model_preview.update_transform();

        model_preview
    }

    pub fn size(&self) -> Vec3 {
        let size = self.max
            .iter()
            .zip(self.min.iter())
            .map(|(max, min)| (max - min).abs())
            .collect::<Vec<_>>();

        Vec3::new(size[0], size[1], size[2])
    }

    pub fn summary(&self) -> ModelSummary {
        ModelSummary {
            size: self.size(),
        }
    }
}

impl Deref for ModelPreviewWithModel {
    type Target = ModelPreview;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl DerefMut for ModelPreviewWithModel {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.inner
    }
}

impl ModelPreviewWithModel {
    pub fn center(&mut self) {
        // Non-Infinite Z: Centering the model on x = 0, y = 0 (in CAD coordinates)
        // Infinite Z: Positioning at [X: center, Y: min]
        self.position_offset.x = -self.center.x;

        if self.infinite_z {
            self.position_offset.z = -self.center.y + self.size().y * self.scale.y * 0.5;
        } else {
            self.position_offset.y = -self.center.y;
        }
    }

    pub fn slicer_coordinates_position_with_offset(&self) -> Vec3 {
        // let mut offset = self.position_offset.clone();
        // offset.y = -offset.y;

        self.position + self.position_offset
    }

    pub fn position_with_offset(&self) -> Vec3 {
        let mut position = self.position.clone();

        position = position + self.position_offset;

        if self.infinite_z {
            // Y and Z axes are swapped in infinite Z printers
            Vec3::new(
                position.x,
                position.z,
                position.y,
            )
        } else {
            position
        }
    }

    pub fn get_center(&self) -> Vec3 {
        Vec3::new(self.center.x, self.center.z, self.center.y)
    }

    pub fn rotation_mat3(&self, webgl_coords: bool) -> Mat3 {
        let signum = if webgl_coords { -1.0 } else { 1.0 };

        1.0
        * Mat3::from_angle_x(degrees(signum * self.rotation.x))
        * if self.infinite_z && webgl_coords {
            1.0
            // Y and Z axes are swapped in infinite Z printers
            * Mat3::from_angle_z(degrees(signum * self.rotation.y))
            * Mat3::from_angle_y(degrees(signum * self.rotation.z))
        } else {
            1.0
            * Mat3::from_angle_y(degrees(signum * self.rotation.y))
            * Mat3::from_angle_z(degrees(signum * self.rotation.z))
        }
    }

    pub fn set_mirror(
        &mut self,
        changes: crate::SetModelMirroring,
        context: &Context,
    ) {
        let next_mirror = Mirror {
            x: changes.x.unwrap_or(self.mirror.x),
            y: changes.y.unwrap_or(self.mirror.y),
            z: changes.z.unwrap_or(self.mirror.z),
        };

        // 1. Re-apply the previous mirror transform to undo it (-1 * -1 = 1)
        // 2. Apply the new mirror transform
        let m1 = self.mirror.to_vec3();
        let m2 = next_mirror.to_vec3();
        let m = m1.mul_element_wise(m2);

        // Update the transform
        let transform = 1.0
            // 2. Apply the mirror transform
            * Mat4::from_nonuniform_scale(m.x, m.y, m.z);
            // 1. The model is already centered

        self.cpu_mesh.transform(&transform);

        // Re-compute the normals (mirroring can flip them so the object glitches - turning dark and
        // reflecting no light)
        self.cpu_mesh.compute_normals();

        self.model = self.create_model(&context);
        self.mirror = next_mirror;
    }

    /// Updates the model's WebGL transformation matrix and returns a transformation matrix suitable
    /// for use in slicer engines.
    pub fn update_transform(&mut self) {
        // let scale = self.mirror.to_vec3().mul_element_wise(self.scale);
        let scale = self.scale;

        // Rotate about the center of the object
        self.model.set_transformation(1.0
            // 4. Translate into position
            // 4.b) Position
            * Mat4::from_translation(self.position_with_offset())
            // 4.a) Bed Offset
            * Mat4::from_translation(Vec3::new(
                self.center.x,
                self.center.y,
                self.size().z / 2.0 * self.scale.z,
            ))
            // 3. Rotate about the center of the object
            * Mat4::from(self.rotation_mat3(true))
            // 2. Scale the model
            * Mat4::from_nonuniform_scale(scale.x, scale.y, scale.z)
            // 1. The model is already centered and mirrored
        );
    }

    pub fn transform_event(&self, source: crate::TransformSource) -> crate::Event {
        let scale = self.mirror.to_vec3().mul_element_wise(self.scale);

        let r =  1.0
            * Mat4::from(self.rotation_mat3(false))
            * Mat4::from_nonuniform_scale(scale.x, scale.y, scale.z);

        let rotation_mat3 = Mat3::new(
            r.x.x, r.x.y, r.x.z,
            r.y.x, r.y.y, r.y.z,
            r.z.x, r.z.y, r.z.z,
        );

        let mat4 = 1.0
            * Mat4::from_translation(self.slicer_coordinates_position_with_offset())
            * Mat4::from_translation(self.center)
            * Mat4::from(self.rotation_mat3(true))
            * Mat4::from_nonuniform_scale(scale.x, scale.y, scale.z)
            * Mat4::from_translation(-self.center);

        crate::Event::Transform(
            crate::Transform {
                source,
                mat4,
                rotation_mat3,
                position_with_offset: self.slicer_coordinates_position_with_offset(),
                position: self.position,
                scale: self.scale,
            }
        )
    }
}
