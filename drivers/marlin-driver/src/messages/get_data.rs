use eyre::{
    eyre,
    Result,
    // Context as _,
};

use crate::machine::{Machine, Machine};

#[xactor::message(result = "Result<MachineData>")]
pub struct GetData;

impl Machine {
    pub fn get_data(&mut self) -> Result<&mut Machine> {
        let id = &self.id;
        self.data.as_mut().ok_or_else(|| {
            eyre!(
                r#"
                Attempted to read machine data but machine-{id}.toml has not yet been parsed.
                Check that your /usr/local/etc/teg/machine-{id}.toml config file is valid!
            "#,
                id = id
            )
        })
    }

    pub fn data_ref(&mut self) -> Result<&Machine> {
        let id = &self.id;
        self.data.as_ref().ok_or_else(|| {
            eyre!(
                r#"
                Attempted to read machine data but machine-{id}.toml has not yet been parsed.
                Check that your /usr/local/etc/teg/machine-{id}.toml config file is valid!
            "#,
                id = id
            )
        })
    }
}

#[async_trait::async_trait]
impl xactor::Handler<GetData> for Machine {
    async fn handle(&mut self, _ctx: &mut xactor::Context<Self>, _msg: GetData) -> Result<Machine> {
        self.get_data().map(|data| data.clone())
    }
}
