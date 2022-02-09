use chrono::prelude::*;
use serde::{Deserialize, Serialize};
// use eyre::{
//     // eyre,
//     Result,
//     // Context as _,
// };
use printspool_json_store::{ Record };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Server {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
    // Foreign Keys
    // Props
    pub name: String,
    /// True if the server row is the self-reference to this instance
    pub is_self: bool,
}

#[async_trait::async_trait]
impl Record for Server {
    const TABLE: &'static str = "servers";

    fn id(&self) -> &crate::DbId {
        &self.id
    }

    fn version(&self) -> printspool_json_store::Version {
        self.version
    }

    fn version_mut(&mut self) -> &mut printspool_json_store::Version {
        &mut self.version
    }

    fn created_at(&self) -> DateTime<Utc> {
        self.created_at
    }

    fn deleted_at(&self) -> Option<DateTime<Utc>> {
        self.deleted_at
    }

    fn deleted_at_mut(&mut self) -> &mut Option<DateTime<Utc>> {
        &mut self.deleted_at
    }
}
