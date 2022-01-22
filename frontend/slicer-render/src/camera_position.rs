
use serde::Deserialize;
use three_d::*;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum CameraPosition {
    Isometric,
    Front,
    Back,
    Top,
    Bottom,
    Left,
    Right,
}

impl CameraPosition {
    pub fn set_view(
        &self,
        camera: &mut Camera,
        machine_dim: Vec3,
        median_dim: f32,
    ) {
        use CameraPosition::*;

        let center = machine_dim / 2.0;
        // For reasons unknown this fixes the camera when facing Up/Down
        let vertical_z_offset = -20.0;

        let position = match self {
            Isometric => Vec3::new(-(median_dim + 150.0), median_dim + 150.0, -(median_dim + 200.0)),
            Front => Vec3::new(0.0, center.y, -(machine_dim.z + 300.0)),
            Back => Vec3::new(0.0, center.y, machine_dim.z + 300.0),
            Top => Vec3::new(0.0, machine_dim.y * 1.5 + 300.0, vertical_z_offset),
            Bottom => Vec3::new(0.0, -(machine_dim.y * 1.5 + 300.0), vertical_z_offset),
            Left => Vec3::new(machine_dim.z + 300.0, center.y, 0.0),
            Right => Vec3::new(-(machine_dim.z + 300.0), center.y, 0.0),
        };

        camera.set_view(
            position,
            Vec3::new(0.0, center.y, 0.0),
            Vec3::new(0.0, 1.0, 0.0),
        ).unwrap();
    }
}
