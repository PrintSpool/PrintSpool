// use anyhow::{
//     // anyhow,
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

        // eg. Teg 0.1.0 for linux/x86_64
        format!(
            "Teg {version_number} for {target} {os}",
            version_number = version_number,
            target = built_info::CFG_TARGET_ARCH,
            os = built_info::CFG_OS,
        )
    }

    // TODO: Do we need pending updates still in the new architecture?
    // hasPendingUpdates
}
