use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use teg_json_store::{Record, UnsavedRecord};


#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct Print {
    #[new(value = "nanoid!()")]
    pub id: crate::DbId,
    #[new(default)]
    pub version: i32,
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    // Foreign Keys
    pub print_queue_id: crate::DbId, // print queues have many (>=0) parts
    pub package_id: crate::DbId, // packages have many (>=1) parts
    /// If true the package content can be removed once the Print is complete
    pub is_package_owner: bool,
}

// #[derive(Debug, Serialize, Deserialize, Clone)]
// pub struct UnsavedPrint {
//     pub id: crate::DbId,
//     // Foreign Keys
//     pub print_queue_id: crate::DbId, // print queues have many (>=0) parts
//     pub package_id: crate::DbId, // packages have many (>=1) parts
//     /// If true the package content can be removed once the Print is complete
//     pub is_package_owner: bool,
// }

impl Record for Print {
    const TABLE: &'static str = "tasks";

    fn id(&self) -> crate::DbId {
        self.id
    }

    fn version(&self) -> crate::DbId {
        self.version
    }

    fn version_mut(&mut self) -> &mut crate::DbId {
        &mut self.version
    }
}

#[async_trait::async_trait]
impl UnsavedRecord<Print> for Print {}
