use async_std::future;
use async_graphql::{
    ID,
    FieldResult,
    Context,
};
use eyre::{
    eyre,
    // Result,
    Context as _,
};
use teg_auth::{
    AuthContext,
};

use super::{
    WEBRTC_STREAMER_API,
    IceCandidate,
    Media,
    get_ice_candidates,
};

#[derive(async_graphql::SimpleObject, Debug)]
pub struct VideoSource {
    id: ID,
}

#[derive(Default)]
pub struct VideoQuery;

#[async_graphql::Object]
impl VideoQuery {
    #[instrument(skip(self, ctx))]
    async fn video_sources<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
    ) -> FieldResult<Vec<VideoSource>> {
        let auth: &AuthContext = ctx.data()?;

        let _ = auth.require_authorized_user()?;

        async move {
            let req = surf::post(&format!("{}/getMediaList", WEBRTC_STREAMER_API))
                .recv_json();

            let media_list: Vec<Media> = future::timeout(std::time::Duration::from_millis(5_000), req)
                .await
                .wrap_err("Video sources list timed out")?
                .map_err(|err| eyre!(err)) // TODO: Remove me when surf 2.0 is released
                .wrap_err("Error getting video sources list")?;

            let video_sources = media_list.into_iter()
                .map(|media| VideoSource {
                    id: media.video.into()
                })
                .collect();

            eyre::Result::<_>::Ok(video_sources)
        }
        // log the backtrace which is otherwise lost by FieldResult
        .await
        .map_err(|err| {
            warn!("{:?}", err);
            err.into()
        })

    }

    #[instrument(skip(self, ctx))]
    async fn ice_candidates<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        video_session_id: ID,
    ) -> FieldResult<Vec<IceCandidate>> {
        let auth: &AuthContext = ctx.data()?;

        let user = auth.require_authorized_user()?;

        if !video_session_id.starts_with(&format!("{}.", user.id)) {
            Err(eyre!("Invalid Video Session ID"))?;
        }

        let ice_candidates = get_ice_candidates(&video_session_id).await?;
        Ok(ice_candidates)
    }
}
