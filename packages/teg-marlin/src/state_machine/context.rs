use chrono::prelude::*;
use super::Task;
use std::collections::vec_deque::VecDeque;
use crate::protos::{
    machine_message::{
        self,
        Event,
        Error,
        EventType,
    },
    MachineMessage,
};
use crate::state_machine;
use crate::configuration::{
    Config,
    Controller,
};

#[derive(Clone, Debug)]
pub struct Context {
    pub config: Config,
    pub controller: Controller,
    pub feedback: machine_message::Feedback,
    response_buffer: VecDeque<machine_message::CommandResponse>,
}

impl Context {
    pub fn new(config: Config) -> Self {
        let status = machine_message::Status::Disconnected as i32;
        let controller = config.get_controller().clone();
        let feedback = Self::reset_feedback(status, &config);
        let response_buffer = VecDeque::with_capacity(controller.response_buffer_size);

        Self {
            feedback,
            config,
            controller,
            response_buffer,
        }
    }

    fn reset_feedback(status: i32, config: &Config) -> machine_message::Feedback {
        machine_message::Feedback {
            status,
            heaters: config.heater_addresses().iter().map(|address| {
                machine_message::Heater {
                    address: address.to_string(),
                    ..machine_message::Heater::default()
                }
            }).collect(),

            ..machine_message::Feedback::default()
        }
    }

    pub fn machine_message_protobuf(&mut self) -> MachineMessage {
        self.feedback.responses = self.response_buffer.drain(..).collect();

        MachineMessage {
            payload: Some(machine_message::Payload::Feedback ( self.feedback.clone() )),
        }
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

        self.feedback.events = previous_feedback.events;

        if let Errored { message } = state  {
            let error = machine_message::Error {
                message: message.clone(),
            };

            self.feedback.error = Some(error);
        };
    }

    pub fn delete_task_history(&mut self, task_ids: &Vec<u32>) {
        let events = std::mem::replace(&mut self.feedback.events, vec![]);
        self.feedback.events = events
            .into_iter()
            .filter(|event| task_ids.contains(&event.task_id) == false)
            .collect();
    }

    pub fn push_start_task(&mut self, task: &Task) {
        add_event(self, task, EventType::StartTask, None);
    }

    pub fn push_cancel_task(&mut self, task: &Task) {
        add_event(self, task, EventType::CancelTask, None);
    }

    pub fn push_pause_task(&mut self, task: &Task) {
        add_event(self, task, EventType::PauseTask, None);
    }

    pub fn push_finish_task(&mut self, task: &Task) {
        add_event(self, task, EventType::FinishTask, None);
    }

    pub fn push_error(&mut self, task: &Task, error: &Error) {
        let error = Some(error.clone());
        add_event(self, task, EventType::FinishTask, error);
    }

    pub fn push_response(&mut self, task: &Task, raw_src: String) {
        let command_response = machine_message::CommandResponse {
            line_number: self.feedback.despooled_line_number,
            task_id: task.id,
            content: raw_src,
        };

        if self.response_buffer.len() >= self.controller.response_buffer_size {
            let _ = self.response_buffer.pop_back();
        }
        self.response_buffer.push_front(command_response)
    }
}

fn add_event(context: &mut Context, task: &Task, event_type: EventType, error: Option<Error>) {
    let events = &mut context.feedback.events;

    events.push(Event {
        task_id: task.id,
        r#type: event_type as i32,
        created_at: Utc::now().timestamp(),
        error,
    });
}
