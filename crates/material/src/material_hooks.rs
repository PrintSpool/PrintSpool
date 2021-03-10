use eyre::{
    // eyre,
    Result,
    // Context as _,
};

#[async_trait::async_trait]
pub trait MaterialHooks {
    async fn after_update<'c>(
        &self,
        id: &crate::DbId,
    ) -> Result<()>;
}
