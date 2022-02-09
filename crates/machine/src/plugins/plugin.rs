use async_graphql::{
    ID,
    FieldResult,
};
// use eyre::{
//     // eyre,
//     Result,
//     // Context as _,
// };
use serde::{Serialize, Deserialize};
use nanoid::nanoid;
use printspool_config_form::ConfigForm;

use super::core::CorePluginConfig;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "package")]
pub enum Plugin {
    #[serde(rename = "teg-core")]
    Core(PluginContainer<CorePluginConfig>),
    // #[serde(other)]
    // UnknownPlugin,
}

#[derive(new, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PluginContainer<Model = toml::Value> {
    #[new(value = "nanoid!(11)")]
    pub id: String,
    #[new(default)]
    pub model_version: printspool_json_store::Version,
    pub model: Model,
}

#[async_graphql::Object]
impl Plugin {
    async fn id(&self) -> ID {
        use Plugin::*;

        match self {
            Core(p) => &p.id,
        }.into()
    }

    async fn name(&self) -> String {
        use Plugin::*;

        match self {
            Core(_) => "teg-core",
        }.into()
    }

    async fn config_form(&self) -> FieldResult<ConfigForm> {
        use Plugin::*;

        match self {
            Core(p) => {
                let config_form = printspool_config_form::into_config_form(p)?;
                Ok(config_form)
            },
        }
    }

    async fn is_essential(&self) -> bool {
        use Plugin::*;

        match self {
            Core(_) => true,
        }
    }

}
