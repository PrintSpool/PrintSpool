use async_graphql::*;
use futures::stream::{
    Stream,
    // StreamExt,
};
use xactor::Actor;
use std::{
    pin::Pin,
    boxed::Box,
};
use async_graphql::context::SelectionField;

#[derive(Default, Clone, Copy)]
pub struct ServerSubscription;

#[derive(async_graphql::SimpleObject, Debug)]
pub struct LiveSubscription {
    query: crate::query::Query,
    patch: Option<Vec<RFC6902Operation>>,
}

#[derive(async_graphql::SimpleObject, Debug)]
pub struct RFC6902Operation {
    op: String,
    path: String,
    from: String,
    value: async_graphql::Json<serde_json::Value>,
}

pub fn selection_field_to_query_string(field: SelectionField) -> String {
    let sub_fields = field.selection_set()
        .map(selection_field_to_query_string)
        .peekable();

    if sub_fields.peek().is_some() {
        format!(
            r#"{field_name} \{
                {sub_fields_frag}
            \}"#,
            field_name = field.name,
            sub_fields_frag = sub_fields.join('\n')
        )
    } else {
        field.name
    }

}

#[Subscription]
impl ServerSubscription {
    /// Live queries over subscriptions
    async fn live<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
    ) -> Result<LiveSubscriptionStream> {
        // TODO: Work in progress

        // Build a query string out of the subfields inside the query field
        let query_field = ctx.field().selection_set()
            .find(|field| field.name == "query")
            .ok_or_else(|| eyre!("query field is required for live subscriptions"))?;

        let query_string = selection_field_to_query_string(query_field);

        // Duplicate schema without data
        let schema = async_graphql::Schema::build(
            query::Query::default(),
            mutation::Mutation::default(),
            async_graphql::EmptySubscription,
        )
            .extension(async_graphql::extensions::Tracing::default())
            .finish();

        // TODO: Data needs to be cloneable. Maybe data needs to be moved to an Arc for this?
        let data = ctx.schema_env.data.clone();

        let stream = LiveSubscriptionStream {
            query_string,
            data,
        };

        Ok(stream)
    }
}

pub struct LiveSubscriptionStream {
    pub query_string: String,
    pub data: async_graphql::Data,
}

enum LiveSubscriptionState {
    Init,
    Query(Box(dyn Future(Item = Result<async_graphql::Value>))),
    Poll(Box(dyn Future(Item = Result<async_graphql::Value>))),
}

impl Stream for LiveSubscriptionStream {
    type Item = Signal;

    fn poll_next(
        mut self: std::pin::Pin<&mut Self>,
        cx: &mut std::task::Context<'_>
    ) -> core::task::Poll<Option<Self::Item>> {
        // self.signals_receiver.as_mut().poll_next(cx)
        // Re-usable query execution
        let exec_query = async move || {
            let request = async_graphql::Request::new(query_string.clone());
            request.data = data.clone();

            let response = schema.execute(request).await;
            if let Some(error) = response.errors.iter().next() {
                // TODO: this could be improved if there was a way to relay a ServerError to the resolver
                Err(eyre("Live Query Error: {}", error));
            };

            eyre::Result::Ok(
                response.data
            )
        };

        // Query the schema once to produce the initial query field value
        exec_query().await?;

        // Create a new query every polling interval (0.5 seconds in this case)
        let response = schema.execute(request).await;
        if let Some(error) = response.errors.iter().next() {
            // TODO: this could be improved if there was a way to relay a ServerError to the resolver
            eyre("Live Query Error: {}", error);
        };

        // TODO: Diff the previous and current query results to produce patch field values


    }
}
