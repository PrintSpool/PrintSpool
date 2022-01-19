use log::{info};
use three_d::*;
use std::{panic, io::Cursor};
use crate::AddModel;
use crate::RenderOptions;
use crate::SetRotation;

pub struct ModelPreview {
    pub model: Model<PhysicalMaterial>,
    pub position: Vec3,
    pub rotation: Vec3,
    pub scale: Vec3,
}

impl ModelPreview {
    pub fn parse_model(
        command: AddModel,
        options: &RenderOptions,
        context: &Context,
    ) -> Option<Self> {
        let now = instant::Instant::now();

        let AddModel {
            file_name,
            content,
        } = command;

        let model_bytes = content.len();

        if content.is_empty() {
            return None;
        }

        info!("Model ({:?}) Size: {:?}MB", file_name, model_bytes / 1_000_000);

        let (cpu_mesh, _center) = if file_name.to_ascii_lowercase().ends_with(".stl") {
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
            let min_z = verticies.iter().map(|v| v[2]).reduce(f32::min).unwrap_or(0f32);

            let mut min = [f32::MAX; 2];
            let mut max = [f32::MIN; 2];
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
                    let y_offset = if options.infinite_z {
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

        let model = Model::new_with_material(
            &context,
            &cpu_mesh,
            model_material,
        )
            .unwrap();

        info!("Parsed STL model ({:.1}MB) in {}ms", (model_bytes as f64 / 1_000_000f64), now.elapsed().as_millis());

        let mut model_preview = Self {
            model,
            position: Vec3::zero(),
            rotation: Vec3::zero(),
            scale: Vec3::zero(),
        };

        model_preview.update_transform();

        Some(model_preview)
    }

    pub fn set_rotation(&mut self, command: SetRotation) {
        self.rotation = Vec3::new(command.x, command.y, command.z);
        self.update_transform();
    }

    fn update_transform(&mut self) {
        // Rotate about the center of the object
        self.model.set_transformation(1.0
            // Mat4::from_translation(Vec3::new(center[0], 0f32, -center[1]))
            * Mat4::from_angle_x(degrees(270.0 + self.rotation.x))
            * Mat4::from_angle_y(degrees(self.rotation.y))
            * Mat4::from_angle_z(degrees(self.rotation.z))
            // * Mat4::from_translation(Vec3::new(-center[0], -center[1], 0f32)));
        );
    }
}
