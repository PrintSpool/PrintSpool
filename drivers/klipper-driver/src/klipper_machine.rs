use async_trait::async_trait;
use bonsaidb::core::{define_basic_unique_mapped_view, schema::Collection};
use chrono::{DateTime, Utc};
use futures_util::{future::Either, stream::StreamExt};
use printspool_driver_interface::{driver_instance::LocalHostDriverInstance, DbId};
use serde_json::json;
use tokio::{
    net::unix::{OwnedWriteHalf, WriteHalf},
    sync::mpsc,
};
use tokio_util::codec::{FramedRead, FramedWrite};
use validator::Validate;

#[derive(Serialize, Deserialize, JsonSchema, Validate, Debug, Clone)]
pub struct KlipperMachine {
    // TODO: This should alert the user that they will overwrite their settings when editing an existing printer.
    #[serde(skip, default = "KlipperMachineTemplate::Custom")]
    pub template: KlipperMachineTemplate,
}
