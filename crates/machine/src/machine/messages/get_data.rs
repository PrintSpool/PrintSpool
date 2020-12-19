use xactor::*;
use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
};

use crate::machine::{
    Machine,
    MachineData,
};

struct GetData();

#[async_trait::async_trait]
impl Handler<GetData> for Machine {
    async fn handle(&mut self, _ctx: &mut Context<Self>, msg: GetData) -> MachineData {
        self.data.clone()
    }
}
