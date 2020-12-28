use crate::machine::{
    Machine,
    MachineData,
};

#[xactor::message(result = "MachineData")]
pub struct GetData();

#[async_trait::async_trait]
impl xactor::Handler<GetData> for Machine {
    async fn handle(&mut self, _ctx: &mut xactor::Context<Self>, _msg: GetData) -> MachineData {
        self.data.clone()
    }
}
