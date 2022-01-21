use log::{info};
use three_d::*;
use std::{panic, io::Cursor, ops::{Deref, DerefMut}};
use crate::RenderOptions;

pub struct ModelPreview {
    cpu_mesh: Option<CPUMesh>,
    pub position: Vec3,
    pub rotation: Vec3,
    pub scale: Vec3,
    min: [f32; 3],
    max: [f32; 3],
    center: Vec3,
    infinite_z: bool,
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

        info!("Model ({:?}) Size: {:?}MB", file_name, model_bytes / 1_000_000);

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

            let min_z = verticies.iter().map(|v| v[2]).reduce(f32::min).unwrap_or(0f32);
            min[2] = min_z;

            for v in &verticies {
                for (i, (val, min)) in v[0..2].iter().zip(min.iter_mut()).enumerate() {
                    if
                        val < min
                        // Center Infinite Z models only on the y depth of their bottom layer
                        && (
                            !options.infinite_z
                            || v[2] == min_z
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
                            || v[2] == min_z
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

            let cpu_mesh = CPUMesh {
                positions,
                normals: Some(normals),
                ..Default::default()
            };

            (cpu_mesh, min, max, center)
        } else {
            panic!("Only .stl files are supported for now");
        };

        info!("Parsed STL model ({:.1}MB) in {}ms", (model_bytes as f64 / 1_000_000f64), now.elapsed().as_millis());

        let model_preview = Self {
            cpu_mesh: Some(cpu_mesh),
            position: Vec3::zero(),
            rotation: Vec3::zero(),
            scale: Vec3::zero(),
            min,
            max,
            center,
            infinite_z: options.infinite_z,
        };

        model_preview
    }

    pub fn with_model(
        mut self,
        context: &Context,
    ) -> ModelPreviewWithModel {
        let cpu_mesh = self.cpu_mesh.take().unwrap();

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

        let model = Model::new_with_material(
            &context,
            &cpu_mesh,
            model_material,
        )
            .unwrap();

        let mut model_preview = ModelPreviewWithModel {
            inner: self,
            model,
        };

        model_preview.center();
        model_preview.move_to_bed();
        model_preview.update_transform();

        model_preview
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
        self.position.x = -self.center[0];
        // Non-Infinite Z: Centering the model on x = 0, y = 0 (in CAD coordinates)
        // Infinite Z: Positioning at [X: center, Y: min]
        self.position.y = if self.infinite_z {
            -self.max[1]
        } else {
            -self.center[1]
        };
    }

    pub fn get_center(&self) -> Vec3 {
        Vec3::new(self.center.x, self.center.z, self.center.y)
        // &self.center
    }

    pub fn move_to_bed(&mut self) {
        self.position.z = -self.min[2]
    }

    pub fn update_transform(&mut self) {
        // Rotate about the center of the object
        self.model.set_transformation(1.0
            // 5. Rotate into WebGL coordinates
            * Mat4::from_angle_x(degrees(-90.0))
            // 4. Translate into position
            * Mat4::from_translation(self.position)
            // 3. Move back to original offset from center
            * Mat4::from_translation(self.center)
            // 2. Rotate about the center of the object
            * Mat4::from_angle_x(degrees(self.rotation.x))
            * Mat4::from_angle_y(degrees(self.rotation.y))
            * Mat4::from_angle_z(degrees(self.rotation.z))
            // 1. Center the model
            * Mat4::from_translation(-self.center)
        );
    }
}
