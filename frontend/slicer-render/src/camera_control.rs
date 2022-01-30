
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

pub struct CameraPositionControl {
    pub camera: Camera,
    pub options: crate::RenderOptions,
    pub target_aabb: Option<AxisAlignedBoundingBox>,
    pub median_dim: f32,
    control: CameraControl,
    min_distance: f32,
    max_distance: f32,
}

impl CameraPositionControl {
    pub fn new(
        options: crate::RenderOptions,
        median_dim: f32,
        min_distance: f32,
        max_distance: f32,
        window: &Window,
        context: &Context,
    ) -> Self {
        let target = Vec3::zero();

        let camera = Camera::new_perspective(
            &context,
            window.viewport().expect("Viewport error"),
            vec3(1.0, 0.0, 0.0),
            target.clone(),
            vec3(0.0, 0.0, 1.0),
            degrees(45.0),
            0.1,
            100000.0,
        )
            .expect("camera error");

        let control = CameraControl {
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
        };

        let mut camera_position_control = Self {
            camera,
            control,
            options,
            target_aabb: None,
            median_dim,
            min_distance,
            max_distance,
        };

        camera_position_control.apply_position(CameraPosition::Isometric);

        camera_position_control
    }

    pub fn handle_events(
        &mut self,
        events: &mut [Event],
    ) -> ThreeDResult<bool> {
        if let CameraAction::Zoom { speed, target, .. } = &mut self.control.scroll_horizontal {
            *speed = 0.1 * target.distance(*self.camera.position());
        }
        self.control.handle_events(&mut self.camera, events)
    }

    pub fn apply_position(
        &mut self,
        camera_position: CameraPosition,
    ) {
        use CameraPosition::*;

        // let machine_dim = self.options.machine_dimensions;
        // let median_dim = self.median_dim;
        let mut default_dim = self.options.machine_dimensions.clone();

        if self.options.infinite_z {
            default_dim.y = 200.0;
        }

        let dim = self.target_aabb
            .map(|aabb| aabb.size())
            .unwrap_or(default_dim);

        let center = dim / 2.0;
        // For reasons unknown this fixes the camera when facing Up/Down
        let vertical_y_offset = 20.0;

        // Matching the camera orientations of Prusa Slicer and Cura "Front" is actually negative.
        let position = match camera_position {
            Isometric => Vec3::new(-(dim.x + 150.0), -(dim.y + 200.0), dim.z + 150.0),
            Front => Vec3::new(0.0, -(dim.y + 300.0), center.z),
            Back => Vec3::new(0.0, dim.y + 300.0, center.z),
            Top => Vec3::new(0.0, vertical_y_offset, dim.z * 1.5 + 300.0),
            Bottom => Vec3::new(0.0, vertical_y_offset, -(dim.z * 1.5 + 300.0)),
            Left => Vec3::new(dim.x + 300.0, 0.0, center.z),
            Right => Vec3::new(-(dim.x + 300.0), 0.0, center.z),
        };

        self.set_view_inner(position)
    }

    pub fn set_target(
        &mut self,
        target_aabb: Option<AxisAlignedBoundingBox>,
    ) {
        self.target_aabb = target_aabb;

        self.set_view_inner(self.camera.position().clone());
    }

    fn set_view_inner(
        &mut self,
        position: Vec3,
    ) {
        let target = self.target_aabb
            .map(|aabb| aabb.center())
            .unwrap_or(Vec3::zero());

        self.control.left_drag_horizontal = CameraAction::OrbitLeft { target, speed: 3.0 };
        self.control.left_drag_vertical = CameraAction::OrbitUp { target, speed: 3.0 };
        self.control.scroll_vertical = CameraAction::Zoom {
            min: self.min_distance,
            max: self.max_distance,
            speed: 1.0,
            target,
        };

        self.camera.set_view(
            position,
            target,
            Vec3::new(0.0, 0.0, 1.0),
        ).unwrap();
    }
}
