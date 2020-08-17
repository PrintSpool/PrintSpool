use std::sync::Arc;
use std::collections::HashMap;
// use futures::prelude::*;
use async_graphql::ID;
// use futures::future;
use serde::{Deserialize, Serialize};
// use serde_json::json;
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use super::AnnotatedGCode;

use crate::{
    // models::VersionedModel,
    // models::VersionedModelResult,
    print_queue::tasks::{
        GCodeAnnotation,
    },
    configuration::Component,
    // materials::Material,
    Context,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SetMaterialsMacro {
    pub toolheads: HashMap<String, ID>,
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
        let host_config = std::fs::read_to_string(
            "/etc/teg/combinator.toml",
        )?;
        let host_config: toml::Value = toml::from_str(&host_config)?;

        // verify that the toolheads exist in the config
        let _ = self.toolheads.iter().map(|(address, _)|
            match config.at_address(address) {
                Some(Component::Toolhead(_)) => {
                    Ok(())
                }
                _ => {
                    Err(anyhow!("Toolhead not found (address: {:?})", address))
                }
            })
            .collect::<Result<Vec<()>>>()?;

        // verify that the material IDs exist
        let _: Vec<bool> = self.toolheads
            .iter()
            .map(|(_, material_id)| {
                host_config["materials"]
                    .as_array()
                    .unwrap_or(&vec![])
                    .iter()
                    .any(|material: &toml::Value| material["id"] == material_id.to_string().into())
                // TODO: move materials to sled db
                // Material::get(&ctx.db, material_id)
            })
            .collect::<Vec<bool>>();

        // Add an annotation that will set the toolhead when the GCode is reached
        let annotation = AnnotatedGCode::Annotation(
            (0, GCodeAnnotation::SetToolheadMaterials())
        );

        Ok(vec![annotation])
    }
}
