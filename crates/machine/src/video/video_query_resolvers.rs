use async_graphql::{Context, FieldResult, ID};
use eyre::{
    eyre,
    // Result,
    Context as _,
};
use printspool_auth::AuthContext;

#[derive(async_graphql::SimpleObject, Debug)]
pub struct VideoSource {
    id: ID,
}

#[derive(Default)]
pub struct VideoQuery;

#[async_graphql::Object]
impl VideoQuery {
    #[instrument(skip(self, ctx))]
    async fn video_sources<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<VideoSource>> {
        let auth: &AuthContext = ctx.data()?;

        let _ = auth.require_authorized_user()?;

        // Skip video capture devices that return an error
        let video_sources = h264_webcam_stream::list_devices()
            .map(|path_buf| {
                Ok(VideoSource {
                    id: path_buf.as_path().to_string(),
                })
            })
            .collect::<Result<Vec<_>>>()?;

        Ok(video_sources)
    }
}
