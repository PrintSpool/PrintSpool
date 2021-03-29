use chrono::prelude::*;
use eyre::{
    eyre,
    Result,
    // Context as _,
};

use crate::{
    machine::{Machine, MachineStatus, Printing, PositioningUnits},
    task::{Task, TaskContent},
};

#[xactor::message(result = "Result<Task>")]
pub struct ResumeTask {
    pub task: Task,
    pub resume_hook: Task,
}

#[async_trait::async_trait]
impl xactor::Handler<ResumeTask> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: ResumeTask) -> Result<Task> {
        let machine_id = self.id.clone();

        // Verify this task was paused
        let paused_state = match &mut self.get_data()?.status {
            MachineStatus::Printing(Printing {
                paused: true,
                paused_state: None,
                ..
            }) => {
                return Err(eyre!("Paused state not set properly. Machine may need to be reset."))
            }
            MachineStatus::Printing(Printing {
                paused: true,
                paused_state: paused_state@Some(_),
                task_id,
            }) if *task_id == msg.task.id => {
                paused_state.take().unwrap()
            }
            _ => {
                return Err(eyre!("Cannot resume. This print is not paused."))
            }
        };

        async move {
            let pre_resume_warm_up = {
                let heat_build_platform = paused_state.config.build_platforms
                    .iter()
                    .flat_map(|build_platform| {
                        build_platform.ephemeral.target_temperature
                    })
                    .map(|target| {
                        format!(
                            "M140 S{target}",
                            target = target,
                        )
                    });

                let heat_extruders = paused_state.config.toolheads
                    .iter()
                    .flat_map(|toolhead| {
                        let address = &toolhead.model.address;
                        let extruder_index = address[1..].parse::<u32>();

                        let target = toolhead.ephemeral.heater.target_temperature;

                        // Note: Invalid extruder addresses are silently dropped here.
                        if let (Ok(extruder_index), Some(target)) = (extruder_index, target) {
                            Some(format!(
                                "M104 S{target} T{index}",
                                target = target,
                                index = extruder_index,
                            ))
                        } else {
                            None
                        }
                    });

                let enable_fans = paused_state.config.speed_controllers
                    .iter()
                    .flat_map(|toolhead| {
                        let address = &toolhead.model.address;
                        let fan_index = address[1..].parse::<u32>();

                        let target = toolhead.ephemeral.target_speed;

                        // Note: Invalid extruder addresses are silently dropped here.
                        if let (Ok(fan_index), Some(target)) = (fan_index.as_ref(), target) {
                            Some(format!(
                                "M106 S{target} P{index}",
                                target = target,
                                index = fan_index,
                            ))
                        } else if let (Ok(fan_index), None) = (fan_index.as_ref(), target) {
                            Some(format!(
                                "M107 P{index}",
                                index = fan_index,
                            ))
                        } else {
                            None
                        }
                    });


                let gcodes: Vec<_> = std::iter::empty()
                    .chain(heat_build_platform)
                    .chain(heat_extruders)
                    .chain(enable_fans)
                    .collect();

                Task {
                    id: nanoid!(11),
                    version: 0,
                    created_at: Utc::now(),
                    deleted_at: None,
                    machine_id: self.id.clone(),
                    part_id: None,
                    despooled_line_number: None,
                    machine_override: false,
                    total_lines: gcodes.len() as u64,
                    content: TaskContent::GCodes(gcodes),
                    annotations: vec![],
                    estimated_filament_meters: None,
                    estimated_print_time: None,
                    status: Default::default(),
                }
            };

            let (self, _) = self.spool_task(
                pre_resume_warm_up,
            ).await?;

            // Run the user-configurable hook
            let ResumeTask {
                task,
                resume_hook,
            } = msg;

            let (self, _) = self.spool_task(
                resume_hook,
            ).await?;

            // Move the machine back into position
            let move_back_to_position = {
                // Move the machine back to the last position of the paused print
                let g1_axes = paused_state.config.axes
                    .iter()
                    .flat_map(|axis| {
                        if let Some(target) = axis.ephemeral.target_position {
                            Some(format!(
                                "{address}{target}",
                                address = axis.model.address.to_ascii_uppercase(),
                                target = target,
                            ))
                        } else {
                            None
                        }
                    })
                    .collect::<Vec<_>>()
                    .join(" ");

                let mut gcodes = vec![
                    "G90".to_string(),
                    "G21".to_string(),
                    format!("G1 {}", g1_axes),
                ];

                // Reset motors enabled, absolute positioning, and inches/millimeters
                gcodes.push(
                    if paused_state.motors_enabled {
                        "M17"
                    } else {
                        "M18"
                    }.to_string()
                );

                gcodes.push(
                    if paused_state.absolute_positioning {
                        "G90"
                    } else {
                        "G91"
                    }.to_string()
                );

                gcodes.push(
                    match paused_state.positioning_units {
                        PositioningUnits::Millimeters => "G21",
                        PositioningUnits::Inches => "G20",
                    }.to_string()
                );

                Task {
                    id: nanoid!(11),
                    version: 0,
                    created_at: Utc::now(),
                    deleted_at: None,
                    machine_id: self.id.clone(),
                    part_id: None,
                    despooled_line_number: None,
                    machine_override: false,
                    total_lines: gcodes.len() as u64,
                    content: TaskContent::GCodes(gcodes),
                    annotations: vec![],
                    estimated_filament_meters: None,
                    estimated_print_time: None,
                    status: Default::default(),
                }
            };

            let (self, _) = self.spool_task(
                move_back_to_position,
            ).await?;

            // Begin printing the task again from the point it was paused at
            let (self, task) = self.spool_task(
                task,
            ).await?;

            // Update the machine status
            self.get_data()?.status = MachineStatus::Printing(Printing {
                task_id: task.id.clone(),
                paused: false,
                paused_state: None,
            });

            info!("Resumed Print #{}", task.id);

            Result::<_>::Ok(task)
        }
            .await
            .map_err(|err| {
                error!("Error resuming task on machine #{}: {:?}", machine_id, err);
                ctx.stop(Some(err));

                eyre!("Unable to resume print due to internal error")
            })
    }
}
