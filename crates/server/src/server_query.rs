use async_graphql::{Context, FieldResult};
use chrono::prelude::*;
use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use printspool_json_store::{JsonRow, Record};
// use async_graphql::{
//     // ID,
//     // Context,
//     FieldResult,
// };
// use printspool_json_store::Record as _;

use crate::{built_info, server::Server};

#[derive(Default)]
pub struct ServerQuery;

#[derive(async_graphql::InputObject, Default, Debug)]
pub struct FeatureFlagsInput {
    filter: Option<Vec<String>>,
}

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

    #[instrument(skip(self, ctx))]
    async fn server_name<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
    ) -> FieldResult<Option<String>> {
        let db: &crate::Db = ctx.data()?;

        async move {
            let servers = sqlx::query_as!(
                JsonRow,
                r#"
                    SELECT servers.props FROM servers
                    WHERE
                        (servers.props->'is_self')::boolean IS TRUE
                "#,
            )
                .fetch_all(db)
                .await?;

            let servers = Server::from_rows(servers)?;

            let name = servers.into_iter().next().map(|server| server.name);

            Result::<_>::Ok(name)
        }
            // log the backtrace which is otherwise lost by FieldResult
            .await
            .map_err(|err| {
                warn!("{:?}", err);
                err.into()
            })
    }

    #[instrument(skip(self))]
    async fn feature_flags(
        &self,
        #[graphql(default)]
        input: FeatureFlagsInput,
    ) -> FieldResult<Vec<String>> {
        let mut flags: Vec<String> = vec![
            // Feature Flags Go Here!
            // "slicer".to_string(),
        ];

        if std::env::var("ENABLE_SLICER") == Ok("1".to_string()) {
            flags.push("slicer".to_string());
        }

        if let Some(filter) = input.filter {
            flags = flags
                .into_iter()
                .filter(|flag| filter.contains(flag))
                .collect();
        }

        Ok(flags)
    }
}
