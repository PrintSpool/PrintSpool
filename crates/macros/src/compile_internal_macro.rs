use eyre::{
    eyre,
    Result,
    // Context as _,
};

use printspool_machine::machine::Machine;
use crate::{AnnotatedGCode, InternalMacro};

#[xactor::message(result = "Result<Vec<AnnotatedGCode>>")]
pub struct CompileInternalMacro(pub InternalMacro);

#[async_trait::async_trait]
impl xactor::Handler<CompileInternalMacro> for Machine {
    async fn handle(
        &mut self,
        _ctx: &mut xactor::Context<Self>,
        msg: CompileInternalMacro
    ) -> Result<Vec<AnnotatedGCode>> {
        use InternalMacro::*;
        let data = self.data
            .as_ref()
            .ok_or_else(|| eyre!(r#"
                Attempted to compile macro but machine-{id}.toml has not yet been parsed.
            "#, id = self.id))?;
        let config = &data.config;

        match msg.0 {
            Home(m) => m.compile(&config).await,
            SetTargetTemperatures(m) => m.compile(&config).await,
            ToggleFans(m) => m.compile(&config).await,
            ToggleHeaters(m) => m.compile(&self.db, &config).await,
            ToggleMotorsEnabled(m) => m.compile(&config).await,
            ContinuousMove(m) => m.compile(&config).await,
            MoveBy(m) => m.compile(&config).await,
            MoveTo(m) => m.compile(&config).await,
        }
    }
}
