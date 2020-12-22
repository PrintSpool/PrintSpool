use xactor::*;

use crate::machine::{
    Machine,
    MachineData,
};

#[message(result = "MachineData")]
pub struct GetData();

#[async_trait::async_trait]
impl Handler<GetData> for Machine {
    async fn handle(&mut self, _ctx: &mut Context<Self>, msg: GetData) -> MachineData {
        self.data.clone()
    }
}
