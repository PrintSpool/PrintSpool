use async_graphql::GQLMergedObject;
use async_std::task;
// use futures::prelude::*;
// use chrono::prelude::*;
// use log::{warn};

use async_graphql::*;

use crate::models::{
    User,
    UpdateUser,
    DeleteUser,
    Invite,
    CreateInviteInput,
    UpdateInvite,
    DeleteInvite,
    consume_invite,

    get_video_sources,
    create_video_sdp,
    VideoSource,
    RTCSignalInput,
    VideoSession,
    IceCandidate,
    get_ice_candidates,
};


use crate::machine::{
    ContinueViewingMachineMutation,
    EStopAndResetMutation,
    query_resolvers::MachineQuery,
};

use crate::print_queue::tasks::{
    PrintQueueMutation,
    query_resolvers::PrintQueueQuery,
};

// #[MergedObject]
// pub struct Query(
//     LegacyQuery,
//     // crate::print_queue::tasks::Query,
// );

#[derive(GQLMergedObject, Default)]
pub struct Mutation(
    LegacyMutation,
    ContinueViewingMachineMutation,
    EStopAndResetMutation,
    PrintQueueMutation,
);

// impl Default for Mutation {
//     fn default() -> Self {
//         Self::new(
//             LegacyMutation,
//             ContinueViewingMachineMutation,
//             EStopAndResetMutation,
//             PrintQueueMutation::default(),
//         )
//     }
// }


#[derive(GQLMergedObject, Default)]
pub struct Query(
    LegacyQuery,
    PrintQueueQuery,
    MachineQuery,
);

// impl Default for Query {
//     fn default() -> Self {
//         Self::new(
//             LegacyQuery,
//             PrintQueueQuery,
//             MachineQuery,
//         )
//     }
// }

#[derive(Default)]
pub struct LegacyQuery;

#[Object]
impl LegacyQuery {
    async fn video_sources<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<VideoSource>> {
            get_video_sources(ctx.data()?)
                .await
                .map_err(|err| {
                    error!("ERR {:?}", err);
                    err
                })
                .or(Ok(vec![]))
    }

    async fn ice_candidates<'ctx>(&self, ctx: &'ctx Context<'_>, id: ID) -> FieldResult<Vec<IceCandidate>> {
        get_ice_candidates(ctx.data()?, id)
            .await
            .map_err(|err| {
                error!("ERR {:?}", err);
                err.into()
            })
    }
}

#[derive(Default)]
pub struct LegacyMutation;

#[Object]
impl LegacyMutation {
    // async fn authenticate_user<'ctx>(
    //     &self,
    //     ctx: &'ctx Context<'_>,
    //     auth_token: String,
    //     identity_public_key: String
    // ) -> FieldResult<Option<User>> {
    //     Ok(User::authenticate(ctx.data()?, auth_token, identity_public_key).await?)
    // }

    // Users
    async fn update_user<'ctx>(&self, ctx: &'ctx Context<'_>, input: UpdateUser) -> FieldResult<User> {
        task::block_on(
            User::update(ctx.data()?, input)
        )
    }

    async fn delete_user<'ctx>(&self, ctx: &'ctx Context<'_>, input: DeleteUser) -> FieldResult<Option<bool>> {
        task::block_on(
            User::delete(ctx.data()?, input.user_id)
        )
    }

    // Video
    #[field(name = "createVideoSDP")]
    async fn create_video_sdp<'ctx>(&self, ctx: &'ctx Context<'_>, offer: RTCSignalInput) -> FieldResult<VideoSession> {
        task::block_on(
            create_video_sdp(ctx.data()?, offer)
        )
        .map_err(|err| {
            error!("ERR {:?}", err);
            err.into()
        })
    }
}
