use crate::core::*;
use crate::window::*;

pub struct CadOrbitControl {
    control: CameraControl,
}

impl CadOrbitControl {
    pub fn new(target: Vec3, min_distance: f32, max_distance: f32) -> Self {
        Self {
            control: CameraControl {
                left_drag_horizontal: CameraAction::OrbitLeft { target, speed: 3.0 },
                left_drag_vertical: CameraAction::OrbitUp { target, speed: 3.0 },
                scroll_vertical: CameraAction::Zoom {
                    min: min_distance,
                    max: max_distance,
                    speed: 1.0,
                    target,
                },
                middle_drag_horizontal: CameraAction::Left { speed: 1.0 },
                middle_drag_vertical: CameraAction::Up { speed: 1.0 },
                ..Default::default()
            },
        }
    }

    pub fn handle_events(
        &mut self,
        camera: &mut Camera,
        events: &mut [Event],
    ) -> ThreeDResult<bool> {
        if let CameraAction::Zoom { speed, target, .. } = &mut self.control.scroll_horizontal {
            *speed = 0.1 * target.distance(*camera.position());
        }
        self.control.handle_events(camera, events)
    }
}
