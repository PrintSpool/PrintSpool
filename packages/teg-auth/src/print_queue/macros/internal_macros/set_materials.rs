use std::sync::Arc;
use std::collections::HashMap;
// use futures::prelude::*;
use async_graphql::ID;
use futures::future;
use serde::{Deserialize, Serialize};
// use serde_json::json;
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use super::AnnotatedGCode;

use crate::{
    models::VersionedModel,
    print_queue::tasks::{
        GCodeAnnotation,
    },
    materials::Material,
    Context,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct SetMaterialsMacro {
    toolheads: HashMap<String, ID>,
}

impl SetMaterialsMacro {
    // pub fn key() -> &'static str { "setMaterials" }

    // pub fn json_schema(&self) -> serde_json::Value {
    //     json!({
    //         "type": "object",
    //         "required": ["toolheads"],
    //         "properties": {
    //             "toolheads": {
    //                 "type": "object",
    //                 "additionalProperties": {
    //                     "type": "string",
    //                 },
    //             },
    //         },
    //     })
    // }

    pub async fn compile(&self, ctx: Arc<Context>) -> Result<Vec<AnnotatedGCode>> {
        let config = ctx.machine_config.read().await;

        // verify that the toolheads exist in the config
        let _ = self.toolheads
            .iter()
            .filter(|(address, _)| {
                config.toolhead(address).is_none()
            })
            .map(|(address, _)| {
                Err(anyhow!("Toolhead not found (addres: {:?})", address))
            })
            .collect::<Result<Vec<()>>>()?;

        // verify that the material IDs exist
        let materials = self.toolheads
            .iter()
            .map(|(_, material_id)| Material::get(material_id, &ctx.db));

        let _: Vec<Material> = future::join_all(materials)
            .await
            .into_iter()
            .collect::<Result<Vec<Material>>>()?;

        // Add an annotation that will set the toolhead when the GCode is reached
        let annotation = AnnotatedGCode::Annotation(
            (0, GCodeAnnotation::SetToolheadMaterials())
        );

        Ok(vec![annotation])
    }
}
