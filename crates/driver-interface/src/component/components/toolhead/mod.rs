use eyre::{
    eyre,
    Result,
    // Context as _,
};
use printspool_json_store::Record as _;
use printspool_material::{Material, MaterialConfigEnum};
use regex::Regex;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::config::MachineConfig;

use super::ComponentInner;
use super::{AxisEphemeral, HeaterEphemeral};

mod toolhead_resolvers;

#[derive(Default, Debug, Clone)]
pub struct ToolheadEphemeral {
    pub heater: HeaterEphemeral,
    pub axis: AxisEphemeral,
}

pub type Toolhead = ComponentInner<ToolheadConfig, ToolheadEphemeral>;

impl Toolhead {
    pub async fn set_material<'a>(
        db: &crate::Db,
        machine_config: &'a mut MachineConfig,
        toolhead_id: &crate::DbId,
        material_id: &Option<crate::DbId>,
    ) -> Result<&'a mut Toolhead> {
        // Get the toolhead
        let toolhead = machine_config
            .toolheads
            .iter_mut()
            .find(|toolhead| &toolhead.id == toolhead_id)
            .ok_or_else(|| eyre!("Toolhead not found"))?;

        if let Some(material_id) = material_id {
            // Get the material
            let material = Material::get(db, material_id, true).await?;

            let material = match material.config {
                MaterialConfigEnum::FdmFilament(filament) => filament,
            };

            // Set the material id and extruder temperature
            toolhead.model.material_id = Some(material_id.clone());
            toolhead.ephemeral.heater.material_target = Some(material.target_extruder_temperature);

            // Set the bed target temperature
            for build_platform in &mut machine_config.build_platforms {
                build_platform.ephemeral.material_target = Some(material.target_bed_temperature);
            }
        } else {
            toolhead.model.material_id = None;
            toolhead.ephemeral.heater.material_target = None;
        }

        Ok(toolhead)
    }
}
