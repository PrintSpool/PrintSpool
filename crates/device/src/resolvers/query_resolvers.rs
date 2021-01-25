use async_graphql::{
    ID,
    FieldResult,
    Context,
};
use teg_machine::machine::messages::GetData;
use anyhow::{
    anyhow,
    // Result,
    // Context as _,
};

use crate::{Device, device_manager::DeviceManagerAddr, messages::get_devices::GetDevices};

#[derive(Default)]
pub struct DeviceQuery;

#[async_graphql::Object]
impl DeviceQuery {
    #[instrument(skip(self, ctx))]
    async fn devices<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        machine_id: Option<ID>,
    ) -> FieldResult<Vec<Device>> {
        let machines: &teg_machine::MachineMap = ctx.data()?;
        let machines = machines.load();

        let device_manager: &DeviceManagerAddr = ctx.data()?;

        let mut devices = device_manager.call(GetDevices).await?;

        if let Some(machine_id) = machine_id {
            let machine = machines.get(&machine_id)
                .ok_or_else(|| anyhow!("Machine not found: {:?}", machine_id))?
                .call(GetData)
                .await??;

            let device_id = machine.config.get_controller().model.serial_port_id.clone();

            if !devices.contains_key(&device_id) {
                devices.insert(device_id.clone(), Device {
                    id: device_id,
                    connected: false,
                });
            };
        };

        let devices = devices.values().map(|d| d.clone()).collect();
        Ok(devices)
    }
}