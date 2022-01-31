use std::collections::HashMap;

use async_graphql::{
    // Context,
    // ID,
    FieldResult,
};
// use eyre::{
//     eyre,
//     Result,
//     // Context as _,
// };
use cgmath::Matrix4;
use lazy_static::lazy_static;

#[derive(async_graphql::InputObject, Debug, Default)]
struct PrintQueuesInput {
    /// Optional filter: Return only the print queues that are associated with the given machine id
    #[graphql(name="machineID", default)]
    machine_id: Option<async_graphql::ID>,
}

#[derive(async_graphql::InputObject, Debug, Default)]
struct LatestPrintsInput {
    /// Optional filter: Return only the prints that are associated with the given machine ids
    #[graphql(name="machineIDs", default)]
    machine_ids: Option<Vec<async_graphql::ID>>,
    /// Optional filter: Return only the prints that are associated with the given print queues
    #[graphql(name="printQueueIDs", default)]
    print_queue_ids: Option<Vec<async_graphql::ID>>,
}

#[derive(Default)]
pub struct SlicersQuery;

pub struct Slicer {
    id: async_graphql::ID,
    name: String,
    /// Engine-specific transforms to be applied before any model-specific transforms when
    /// exporting a mesh for slicing.
    transform_mat4: Matrix4<f32>,
    /// True if the slicer allows parts to be positioned on the print bed
    allows_positioning: bool,
}

lazy_static! {
    static ref SLICERS: HashMap<String, Slicer> = {
        let mut m = HashMap::new();

        m.insert("curaEngine".into(), Slicer {
            id: "curaEngine".into(),
            name: "Cura Engine".into(),
            transform_mat4: Matrix4::from_scale(1.0),
            allows_positioning: true,
        });

        m.insert("beltEngine".into(), Slicer {
            id: "beltEngine".into(),
            name: "Belt Engine".into(),
            transform_mat4: Matrix4::from_nonuniform_scale(
                1.0,
                -1.0,
                1.0,
            ),
            allows_positioning: false,
        });

        m
    };
}

#[async_graphql::Object]
impl SlicersQuery {
    #[instrument(skip(self))]
    async fn slicer_engines(
        &self,
    ) -> FieldResult<Vec<&'static Slicer>> {
        Ok(SLICERS.values().collect())
    }
}

#[async_graphql::Object]
impl Slicer {
    async fn id(&self) -> &async_graphql::ID { &self.id }
    async fn name(&self) -> &String { &self.name }
    async fn allows_positioning(&self) -> bool { self.allows_positioning }

    async fn transform_mat4(&self) -> Vec<Vec<f32>> {
        let mat4: &[[f32; 4]; 4] = self.transform_mat4.as_ref();
        mat4
            .into_iter()
            .map(|vec| vec.into_iter().map(|v| *v).collect())
            .collect()
    }
}
