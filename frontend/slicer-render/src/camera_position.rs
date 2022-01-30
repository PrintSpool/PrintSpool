
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
        let vertical_y_offset = 20.0;

        // Matching the camera orientations of Prusa Slicer and Cura "Front" is actually negative.
        let position = match self {
            Isometric => Vec3::new(-(median_dim + 150.0), -(median_dim + 200.0), median_dim + 150.0),
            Front => Vec3::new(0.0, -(machine_dim.y + 300.0), center.z),
            Back => Vec3::new(0.0, machine_dim.y + 300.0, center.z),
            Top => Vec3::new(0.0, vertical_y_offset, machine_dim.z * 1.5 + 300.0),
            Bottom => Vec3::new(0.0, vertical_y_offset, -(machine_dim.z * 1.5 + 300.0)),
            Left => Vec3::new(machine_dim.x + 300.0, 0.0, center.z),
            Right => Vec3::new(-(machine_dim.x + 300.0), 0.0, center.z),
        };

        camera.set_view(
            position,
            Vec3::new(0.0, 0.0, 0.0),
            Vec3::new(0.0, 0.0, 1.0),
        ).unwrap();
    }
}
