use machine_message::TaskStatus;
use super::Task;
use std::collections::vec_deque::VecDeque;
use printspool_protobufs::MachineFlags;
use crate::protos::{
    machine_message::{
        self,
    },
    // MachineMessage,
};
use crate::state_machine;
use printspool_machine::{
    config::MachineConfig,
    components::Controller,
};

#[derive(Clone, Debug)]
pub struct Context {
    pub baud_rate: u32,
    pub current_hotend_index: u32,
    pub machine_flags: MachineFlags,

    pub config: MachineConfig,
    pub controller: Controller,

    pub reset_when_idle: bool,

    pub feedback: machine_message::Feedback,
    gcode_history_buffer: VecDeque<machine_message::GCodeHistoryEntry>,
}

impl Context {
    pub fn new(config: MachineConfig) -> Self {
        let status = machine_message::Status::Disconnected as i32;
        let controller = config.get_controller().clone();
        let feedback = Self::reset_feedback(status, &config);
        let gcode_history_buffer = VecDeque::with_capacity(
            controller.model.gcode_history_buffer_size
        );

        Self {
            baud_rate: 115_200,
            current_hotend_index: 0,
            machine_flags: MachineFlags::default(),
            reset_when_idle: false,
            feedback,
            config,
            controller,
            gcode_history_buffer,
        }
    }

    fn reset_feedback(status: i32, config: &MachineConfig) -> machine_message::Feedback {
        machine_message::Feedback {
            status,
            heaters: config.heater_addresses().into_iter().map(|address| {
                machine_message::Heater {
                    address: address,
                    ..machine_message::Heater::default()
                }
            }).collect(),
            axes: config.feedrates().into_iter().map(|f| {
                machine_message::Axis {
                    address: f.address,
                    ..machine_message::Axis::default()
                }
            }).collect(),
            speed_controllers: config.speed_controllers.iter().map(|sc| {
                machine_message::SpeedController {
                    address: sc.model.address.clone(),
                    ..machine_message::SpeedController::default()
                }
            }).collect(),

            ..machine_message::Feedback::default()
        }
    }

    pub fn add_gcode_history_to_feedback(&mut self) -> () {
        // println!("History Buffer: {:?}", self.gcode_history_buffer);
        self.feedback.gcode_history = self.gcode_history_buffer.drain(..).collect();
    }

    pub fn handle_state_change(&mut self, state: &state_machine::State) {
        use state_machine::State::*;

        let status = match state {
            Disconnected => machine_message::Status::Disconnected as i32,
            Connecting {..} => machine_message::Status::Connecting as i32,
            Ready( .. ) => machine_message::Status::Ready as i32,
            Errored { .. } => machine_message::Status::Errored as i32,
            EStopped => machine_message::Status::Estopped as i32,
        };

        // reset everything except the new status and then move over the events from the previous struct
        let next_feedback = Self::reset_feedback(status, &self.config);

        let previous_feedback = std::mem::replace(&mut self.feedback, next_feedback);

        self.feedback.task_progress = previous_feedback.task_progress;
        self.current_hotend_index = 0;

        if let Errored { message } = state  {
            let error = machine_message::Error {
                message: message.clone(),
            };

            self.feedback.error = Some(error);
        };
    }

    pub fn delete_task_history(&mut self, task_ids: &Vec<crate::DbId>) {
        self.feedback.task_progress.retain(|p| {
            !task_ids.contains(&p.task_id)
        });
    }

    pub fn push_start_task(&mut self, task: &Task) {
        self.push_task_progress(task, TaskStatus::TaskStarted);
    }

    pub fn push_cancel_task(&mut self, task: &Task) {
        self.push_task_progress(task, TaskStatus::TaskCancelled);
    }

    pub fn push_pause_task(&mut self, task: &Task) {
        self.machine_flags.set(MachineFlags::PAUSED_STATE, true);
        self.push_task_progress(task, TaskStatus::TaskPaused);
    }

    pub fn push_finish_task(&mut self, task: &Task) {
        self.push_task_progress(task, TaskStatus::TaskFinished);
    }

    pub fn push_error(&mut self, task: &Task) {
        self.push_task_progress(task, TaskStatus::TaskErrored);
    }

    fn push_task_progress(
        &mut self,
        task: &Task,
        status: TaskStatus,
    ) {
        if task.client_id == "INTERNAL" {
            return
        };

        // trace!("Pusing {:?} for #{:?}", status, task.id);
        let despooled_line_number = task.despooled_line_number
            .unwrap_or(0);

        let progress = self.feedback.task_progress
            .iter_mut()
            .find(|p| p.task_id == task.id);

        if let Some(mut progress) = progress {
            // Optimized by re-using existing progress structs if they exist
            progress.despooled_line_number = despooled_line_number;
            progress.status = status as i32;
        } else {
            // If a progress struct doesn't exist for this task we push a new one
            let new_progress = machine_message::TaskProgress {
                task_id: task.id.clone(),
                despooled_line_number,
                status: status as i32,
            };

            self.feedback.task_progress.push(new_progress);
        }
    }

    pub fn push_gcode_rx(&mut self, raw_src: String, is_polling: bool) {
        // Placeholder: Some day we might allow a toggle to display polling gcodes
        if is_polling {
            return
        }

        let direction = machine_message::GCodeHistoryDirection::Rx as i32;
        self.push_gcode_history_entry(raw_src, direction)
    }

    pub fn push_gcode_tx(&mut self, raw_src: String, is_polling: bool) {
        // Placeholder: Some day we might allow a toggle to display polling gcodes
        if is_polling {
            return
        }

        let direction = machine_message::GCodeHistoryDirection::Tx as i32;
        self.push_gcode_history_entry(raw_src, direction)
    }

    fn push_gcode_history_entry(&mut self, content: String, direction: i32) {
        let entry = machine_message::GCodeHistoryEntry {
            content,
            direction,
        };

        if self.gcode_history_buffer.len() >= self.controller.model.gcode_history_buffer_size {
            let _ = self.gcode_history_buffer.pop_front();
        }
        self.gcode_history_buffer.push_back(entry)
    }
}
