use chrono::prelude::*;
// use eyre::{
//     // eyre,
//     Result,
//     // Context as _,
// };
// use async_graphql::{
//     // ID,
//     // Context,
//     FieldResult,
// };
// use teg_json_store::Record as _;

use crate::built_info;

#[derive(Default)]
pub struct ServerQuery;

#[async_graphql::Object]
impl ServerQuery {
    async fn server_version(&self) -> String {
        // See https://docs.rs/built/0.4.4/built/
        let version_number = built_info::GIT_VERSION.unwrap_or("DEV");

        let dirty_string = if built_info::GIT_DIRTY.unwrap_or(false) {
            " + Uncommitted Changes"
        } else {
            ""
        };

        // eg. Teg 0.1.0 for linux/x86_64
        format!(
            "Teg {version_number}{dirty_string}",
            version_number = version_number,
            dirty_string = dirty_string,
        )
    }

    /// Returns the current date time from the server. Useful for determining the connection
    /// latency.
    async fn ping(&self) -> DateTime<Utc> {
        Utc::now()
    }

    // TODO: Do we need pending updates still in the new architecture?
    // hasPendingUpdates
}
