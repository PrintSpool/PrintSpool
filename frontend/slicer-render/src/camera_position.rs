
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
        center: Vec3,
        max_dim: f32,
    ) {
        use CameraPosition::*;

        // For reasons unknown this fixes the camera when facing Up/Down
        let vertical_x_offset = 15.0;

        let position = match self {
            Isometric => Vec3::new(-(max_dim + 150.0), max_dim + 150.0, -(max_dim + 200.0)),
            Front => Vec3::new(max_dim + 300.0, center.y, 0.0),
            Back => Vec3::new(-(max_dim + 300.0), center.y, 0.0),
            Top => Vec3::new(vertical_x_offset, max_dim + 300.0, 0.0),
            Bottom => Vec3::new(vertical_x_offset, -(max_dim + 300.0), 0.0),
            Left => Vec3::new(0.0, 0.0, max_dim + 300.0),
            Right => Vec3::new(0.0, 0.0, -(max_dim + 300.0)),
        };

        camera.set_view(
            position,
            Vec3::new(0.0, center.y, 0.0),
            Vec3::new(0.0, 1.0, 0.0),
        ).unwrap();
    }
}
