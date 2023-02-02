use std::{collections::BTreeSet, time::Duration};
use std::collections::VecDeque;
use std::collections::HashMap;
use std::convert::identity;

use nom_reprap_response::{
    Response,
    Feedback, Busy,
};

use crate::gcode_codec::{
    GCodeLine,
};

use super::{
    Loop,
    State::*,
    Event::{self, *},
    Effect,
    Task,
    errored,
    send_serial,
    Context,
    disconnect,
};

use crate::protos::{
    ServerMessage,
    server_message,
};

#[derive(Copy, Clone, Debug, PartialEq)]
pub enum Polling {
    PollTemperature,
    PollPosition,
}

#[derive(Copy, Clone, Debug, PartialEq)]
pub enum OnOK {
    TransitionToReady,
    Resend,
    IgnoreOK,
    Despool,
    NotAwaitingOk,
}

#[derive(serde::Deserialize, Debug)]
enum HostGCode {
    #[serde(rename = "markTargetPosition")]
    MarkTargetPosition {},
    #[serde(rename = "waitToReachMark")]
    WaitToReachMark(WaitToReachMark),
}

#[derive(serde::Deserialize, Debug)]
struct WaitToReachMark {
    axes: HashMap<String, MarkAxisDirection>,
}

#[derive(serde::Deserialize, Debug)]
struct MarkAxisDirection {
    forward: bool,
}

#[derive(Clone, Debug)]
struct MarkAxis {
    address: String,
    forward: bool,
    target_position: f32,
}

#[derive(Clone, Debug)]
enum Mark {
    MarkSet(Vec<crate::protos::machine_message::Axis>),
    WaitingToReachMark(Vec<MarkAxis>),
    WaitingToSendFallbackGCode,
}

#[derive(Clone, Debug)]
pub struct ReadyState {
    mark: Option<Mark>,
    poll_for: Option<Polling>,
    awaiting_polling_delay: bool,
    awaiting_polling_feedback: bool,
    tickles_attempted: u32,
    pub last_gcode_sent: Option<String>,
    on_ok: OnOK,
    next_serial_line_number: u32,
    // spool
    loading_gcode: bool,
    pub tasks: VecDeque<Task>,
    pub actual_positions_received: BTreeSet<String>,
    pub capabilities: BTreeSet<String>,
}

impl Default for ReadyState {
    fn default() -> Self {
        let mut tasks = VecDeque::new();
        tasks.push_front(Task {
            id: "FIRMWARE_INFO".into(),
            client_id: "INTERNAL".into(),
            gcode_lines: vec!["M115".to_string()].into_iter(),
            despooled_line_number: None,
            machine_override: true,
            started: false,
        });

        Self {
            mark: None,
            on_ok: OnOK::TransitionToReady,
            last_gcode_sent: None,
            poll_for: Some(Polling::PollTemperature),
            awaiting_polling_delay: false,
            awaiting_polling_feedback: false,
            tickles_attempted: 0,
            next_serial_line_number: 1,
            // spool
            loading_gcode: false,
            tasks,
            actual_positions_received: Default::default(),
            capabilities: Default::default(),
        }
    }
}

impl ReadyState {
    fn and_no_effects(self) -> Loop {
        Ready( self ).and_no_effects()
    }

    pub fn consume(mut self, event: Event, context: &mut Context) -> Loop {
        match event {
            ProtobufRec( msg@ServerMessage { payload: None } ) => {
                warn!("Warning: ServerMessage received without a payload. Ignoring: {:?}", msg);
                self.and_no_effects()
            }
            ProtobufRec( ServerMessage { payload: Some(message) } ) => {
                // eprintln!("PROTOBUF RECEIVED WHEN READY {:?}", message);
                match message {
                    server_message::Payload::SpoolTask(spool_task) => {
                        use server_message::{
                            spool_task::Content,
                            InlineContent,
                        };

                        self.loading_gcode = true;

                        let server_message::SpoolTask {
                            task_id,
                            client_id,
                            start_at_line_number,
                            content,
                            machine_override,
                        } = spool_task;

                        let despooled_line_number = if start_at_line_number == 0 {
                            None
                        } else {
                            Some((start_at_line_number - 1) as u32)
                        };

                        match content {
                            Some(Content::Inline ( InlineContent { commands })) => {
                                let task = Task {
                                    id: task_id,
                                    client_id,
                                    gcode_lines: commands.into_iter(),
                                    machine_override,
                                    started: false,
                                    despooled_line_number,
                                };
                                self.consume(GCodeLoaded(task), context)
                            }
                            Some(Content::FilePath( file_path )) => {
                                let effects = vec![
                                    Effect::LoadGCode {
                                        file_path: file_path.clone(),
                                        task_id,
                                        client_id,
                                        machine_override,
                                        despooled_line_number,
                                    },
                                ];
                                Loop::new(Ready(self), effects)
                            }
                            None => {
                                warn!("Warning: spool_task received without content. Ignoring.");
                                self.and_no_effects()
                            }
                        }
                    }
                    server_message::Payload::PauseTask(server_message::PauseTask { task_id }) => {
                        let task = self.tasks
                            .iter()
                            .position(|task| task.id == task_id)
                            .and_then(|index| self.tasks.remove(index));

                        match task {
                            Some(task) => {
                                context.push_pause_task(&task);

                                if context.reset_when_idle && self.tasks.is_empty() {
                                    return Loop::new(
                                        Ready(self),
                                        vec![
                                            Effect::SendFeedbackProtobuf,
                                            Effect::ExitProcessAfterDelay,
                                        ],
                                    )
                                }

                                Loop::new(
                                    Ready(self),
                                    vec![Effect::SendFeedbackProtobuf],
                                )
                            }
                            _ => {
                                self.and_no_effects()
                            }
                        }
                    }
                    _ => {
                        self.and_no_effects()
                    }
                }
            }
            SerialPortDisconnected => {
                disconnect(&Ready(self), context)
            }
            GCodeLoaded ( mut task ) => {
                // Skip to through the despooled lines in a print is being resumed
                if let Some(despooled_line_number) = task.despooled_line_number {
                    for _ in 0..despooled_line_number {
                        task.gcode_lines.next();
                    }
                }

                if task.machine_override {
                    let first_non_override = self.tasks.iter()
                        .position(|t| !t.machine_override)
                        .unwrap_or(self.tasks.len());
                    // insert the overide task before the first non-override task
                    self.tasks.insert(first_non_override, task)
                } else {
                    // append non-override tasks to the end of the queue
                    self.tasks.push_back(task)
                };

                // despool the first line of the task if ready to do so
                if let OnOK::NotAwaitingOk = self.on_ok {
                    let mut effects = vec![];

                    let result = self.despool_task(&mut effects, context);

                    match result {
                        Err(err) => {
                            errored(err.to_string(), &Ready(self), context)
                        }
                        Ok(_) => {
                            Loop::new(Ready(self), effects)
                        }
                    }
                } else {
                    self.and_no_effects()
                }
            }
            /* Echo, Debug and Error function the same in all states */
            SerialRec((src, response)) => {
                // eprintln!("RX: {:?}", response.raw_src);

                let is_polling_feedback = match response {
                    | Response::Ok(_)
                    | Response::Feedback(_) => self.awaiting_polling_feedback,
                    _ => false
                };

                context.push_gcode_rx(src, is_polling_feedback);

                match response {
                    /* No ops */
                    | Response::Unknown
                    | Response::Echo(_)
                    | Response::Debug(_)
                    | Response::Warning { .. } => {
                        self.and_no_effects()
                    }
                    /* Errors */
                    Response::Error(error) => {
                        errored(error.to_string(), &Ready(self), context)
                    }
                    Response::Greeting => {
                        let message = format!(
                            "Unexpected printer firmware restart. State: {:?}",
                            self,
                        );

                        errored(message, &Ready(self), context)
                    }
                    Response::FirmwareVersion(firmware_version) => {
                        info!("Firmware version: {:?}", firmware_version);
                        self.and_no_effects()
                    },
                    Response::Capability(capability, enabled) => {
                        if capability == "AUTOREPORT_TEMP" && enabled {
                            self.tasks.push_front(Task {
                                id: "AUTOREPORT_TEMP".into(),
                                client_id: "INTERNAL".into(),
                                gcode_lines: vec![
                                    "M155 S1".to_string(),
                                ].into_iter(),
                                despooled_line_number: None,
                                machine_override: true,
                                started: false,
                            });
                        }

                        if enabled {
                            self.capabilities.insert(capability);
                        }
                        self.and_no_effects()
                    },
                    Response::Ok( feedback ) => {
                        let result = feedback
                            .map(|feedback| self.receive_feedback( &feedback, context ))
                            .transpose()
                            .and_then(|effects| {
                                let mut effects = effects.unwrap_or(vec![]);
                                self.receive_ok(&mut effects, context)?;
                                Ok(effects)
                            });

                        match result {
                            Err(err) => {
                                errored(err.to_string(), &Ready(self), context)
                            }
                            Ok(effects) => {
                                Loop::new(
                                    Ready(self),
                                    effects,
                                )
                            }
                        }
                    }
                    Response::Feedback( feedback ) => {
                        let result = self.receive_feedback( &feedback, context );
                        match result {
                            Ok(mut effects) => {
                                effects.push(
                                    Effect::CancelDelay { key: "tickle_delay".to_string() }
                                );
                                effects.push(
                                    Effect::SendFeedbackProtobuf,
                                );

                                Loop::new(
                                    Ready(self),
                                    effects,
                                )
                            }
                            Err(err) => {
                                errored(err.to_string(), &Ready(self), context)
                            }
                        }
                    }
                    Response::Resend(resend) => {
                        self.receive_resend_request(resend.line_number, context)
                    }
                }
            }
            PollFeedback => {
                self.poll_for = Some(Polling::PollTemperature);

                // eprintln!("POLL FEEDBACK!!!!! {:?}", self);
                if let OnOK::NotAwaitingOk = self.on_ok {
                    let mut effects = vec![];

                    self.poll_feedback(&mut effects, context, Polling::PollTemperature);

                    Loop::new(
                        Ready(self),
                        effects,
                    )
                } else {
                    self.and_no_effects()
                }
            }
            TickleSerialPort => {
                self.tickle_serial_port(context)
            }
            _ => Ready( self ).invalid_transition_error(&event, context)
        }
    }

    fn receive_feedback(
        &mut self,
        feedback: &Feedback,
        context: &mut Context
    ) -> eyre::Result<Vec<Effect>> {
        match feedback {
            Feedback::Busy(Busy::PausedForUser) => {
                // Marlin sends an extra OK after filament swaps so make sure to ignore those
                self.on_ok = OnOK::IgnoreOK;
                Ok(vec![])
            }
            Feedback::ActualTemperatures(temperatures) => {
                // set actual_temperatures
                temperatures.iter().for_each(|(address, val)| {
                    let heater = context.feedback.heaters
                        .iter_mut()
                        .find(|h| h.address == *address);

                    if let Some(heater) = heater {
                        heater.actual_temperature = *val;
                    } else {
                        warn!(
                            "Warning: unknown actual_temperature address: {:?} = {:?}°C",
                            address,
                            val,
                        );
                    };
                });

                // update polling timers and send to protobuf clients
                self.awaiting_polling_delay = true;

                let polling_interval = if self.mark.is_some() {
                    // Rapid polling when waiting to reach a position
                    50
                } else {
                    context.controller.model.polling_interval
                };

                let delay = Effect::Delay {
                    key: "polling_delay".to_string(),
                    duration: Duration::from_millis(polling_interval),
                    event: PollFeedback,
                };

                Ok(vec![delay, Effect::SendFeedbackProtobuf])
            },
            Feedback::Positions(positions) => {
                // set actual_positions
                positions.actual_positions.iter().for_each(|(address, val)| {
                    self.actual_positions_received.insert(address.clone());

                    let axis = context.feedback.axes
                        .iter_mut()
                        .find(|a| a.address.to_ascii_lowercase() == *address);

                    if let Some(axis) = axis {
                        axis.actual_position = *val;
                    }
                    // A and B are send by Marlin CoreXY machines. I think C may be used on
                    // Deltabots but that is unconfirmed atm as I don't have one to test with.
                    else if address != "a" && address != "b" && address != "c" {
                        warn!("Warning: unknown actual_position axis: {:?} = {:?}", address, val);
                    }
                });

                // set target_positions
                positions.target_positions.iter().flat_map(identity).for_each(|(address, val)| {
                    let axis = context.feedback.axes
                        .iter_mut()
                        .find(|a| a.address.to_ascii_lowercase() == *address);

                    if let Some(axis) = axis {
                        axis.target_position = *val;
                    }
                    else {
                        warn!("Warning: unknown target_position axis: {:?} = {:?}", address, val);
                    }
                });

                // Check if the mark has been reached
                if let Some(Mark::WaitingToReachMark(mark)) = &self.mark {
                    // In Marlin, CoreXY machine do not report their position in terms of X and Y -
                    // instead they send back A and B positions which we can't use here. So if
                    // we do not receive X and Y positions we fall back to starting and stopping
                    // between continuous move segments.
                    let all_axes_received = mark
                        .iter()
                        .all(|mark| {
                            self.actual_positions_received.contains(&mark.address)
                        });

                    if !all_axes_received {
                        debug!(r#"
                            Macro: Wait to Reach Mark: Non-cartesian printer detected.
                            Falling back to start/stop jogs.
                        "#);
                        self.mark = Some(Mark::WaitingToSendFallbackGCode);
                        return Ok(vec![]);
                    }

                    // true if all the axes have reached or passed the mark in the direction they
                    // were traveling
                    let reached_mark = mark
                        .iter()
                        .all(|mark| {
                            context.feedback.axes
                                .iter()
                                .find(|current| current.address == mark.address)
                                .map(|current| {
                                    // println!(
                                    //     "direction: {}, current: {}, target: {}, Good: {}",
                                    //     mark.forward,
                                    //     current.actual_position,
                                    //     mark.target_position,
                                    //     mark.forward as i32 as f32 * (current.actual_position - mark.target_position) >= 0.0,
                                    // );
                                    mark.forward as i32 as f32 * (current.actual_position - mark.target_position) >= 0.0
                                })
                                .unwrap_or(false)
                        });

                    if reached_mark {
                        debug!("Macro: Wait to Reach Mark [COMPLETE]");
                        self.mark = None;
                        let mut effects = vec![];
                        self.despool(&mut effects, context)?;
                        return Ok(effects);
                    };
                };

                Ok(vec![])
            },
            _ => Ok(vec![]),
        }
    }

    fn receive_ok(&mut self, effects: &mut Vec<Effect>, context: &mut Context) -> eyre::Result<()> {
        for heater in context.feedback.heaters.iter_mut() {
            heater.blocking = false;
        }

        match self.on_ok {
            OnOK::NotAwaitingOk => {
                // Ignore erroneous OKs
                warn!("Warning: Received Unexpected OK");
            }
            OnOK::Resend => {
                let gcode = self.last_gcode_sent
                    .clone()
                    .expect("Cannot resend GCode if none was sent");

                warn!("Resending GCode: {:?}", gcode);

                send_serial(
                    effects,
                    GCodeLine {
                        gcode,
                        line_number: Some(self.next_serial_line_number - 1),
                        checksum: true,
                    },
                    context,
                    false,
                );

                self.on_ok = OnOK::IgnoreOK;
            }
            OnOK::IgnoreOK => {
                // Do not cancel the trickle here because it will already have been overwritten by the resend request
                self.on_ok = OnOK::Despool;
            }
            OnOK::TransitionToReady => {
                info!("Connected");
                context.handle_state_change(&Ready( self.clone() ));

                // let the protobuf clients know that the machine is ready
                effects.push(Effect::SendFeedbackProtobuf);

                self.on_ok = OnOK::Despool;
                self.receive_ok(effects, context)?;
            }
            OnOK::Despool => {
                self.despool(effects, context)?;
            }
        }

        Ok(())
    }

    fn despool(&mut self, effects: &mut Vec<Effect>, context: &mut Context) -> eyre::Result<()> {
        if let Some(Mark::WaitingToSendFallbackGCode) = self.mark {
            debug!("Sending Mark Start & Stop Fallback GCode (M400)");
            send_serial(
                effects,
                GCodeLine {
                    gcode: "M400".to_string(),
                    line_number: Some(self.next_serial_line_number),
                    checksum: true,
                },
                context,
                true,
            );

            self.mark = None;
            self.on_ok = OnOK::Despool;
            self.next_serial_line_number += 1;
        } else if let Some(poll_for) = self.poll_for {
            self.poll_feedback(effects, context, poll_for);
        } else {
            self.despool_task(effects, context)?;
        };
        Ok(())
    }

    fn despool_task(&mut self, effects: &mut Vec<Effect>, context: &mut Context) -> eyre::Result<()> {
        self.awaiting_polling_feedback = false;

        if let Some(Mark::WaitingToReachMark(_)) = self.mark {
            self.on_ok = OnOK::NotAwaitingOk;
            return Ok(());
        };

        if let Some(task) = self.tasks.front_mut() {
            let gcode = task.next_gcode();

            if let Some(gcode) = gcode {
                if !task.started {
                    trace!("Despool: Starting Task #{}", task.id);
                    task.started = true;

                    effects.push(
                        Effect::SendFeedbackProtobuf,
                    );
                };

                trace!("Despool: Task GCode");

                let despooled_line_number = task.despooled_line_number
                    .map(|n| n + 1)
                    .unwrap_or(0);

                task.despooled_line_number = Some(despooled_line_number);

                context.push_start_task(&task);

                if gcode.starts_with('!') {
                    self.execute_host_gcode(effects, context, &gcode)?;
                } else {
                    send_serial(
                        effects,
                        GCodeLine {
                            gcode,
                            line_number: Some(self.next_serial_line_number),
                            checksum: true,
                        },
                        context,
                        false,
                    );

                    self.on_ok = OnOK::Despool;
                    self.next_serial_line_number += 1;
                };
            } else {
                trace!("Despool: Completed Task #{}", task.id);

                // record a task completion event
                context.push_finish_task(&task);

                effects.push(
                    Effect::SendFeedbackProtobuf,
                );

                let _ = self.tasks.pop_front();

                // use recursion to despool the next line
                self.despool(effects, context)?;
            };
        } else {
            trace!("Despool: Nothing to send");

            self.on_ok = OnOK::NotAwaitingOk;
            // Cancel the tickle if there's nothing else to send_serial
            effects.push(
                Effect::CancelDelay { key: "tickle_delay".to_string() }
            );

            if context.reset_when_idle {
                effects.push(Effect::ExitProcessAfterDelay)
            };
        };

        Ok(())
    }

    fn execute_host_gcode(
        &mut self,
        effects: &mut Vec<Effect>,
        context: &mut Context, gcode: &str,
    ) -> eyre::Result<()> {
        let gcode: HostGCode = serde_json::from_str(&gcode[1..])?;

        debug!("Macro: {:?}", gcode);

        match gcode {
            HostGCode::MarkTargetPosition {..} => {
                self.mark = Some(Mark::MarkSet(context.feedback.axes.clone()));
            },
            HostGCode::WaitToReachMark(mut args) => {
                if let Some(Mark::MarkSet(axes)) = &self.mark {
                    let mark = axes
                        .into_iter()
                        // Wait to reach mark cannot reliably catch direction changes due to
                        // the fact that it may reach it's mark and then return away from it
                        // between polling. The solution for now is to treat axes with direction
                        // changes as no-ops and remove them from the mark.
                        .filter(|mark_axis| {
                            context.feedback.axes
                                .iter()
                                .find(|a| a.address == mark_axis.address)
                                .map(|a| a.direction == mark_axis.direction)
                                .unwrap_or(false)
                        })
                        // Filter down to only the axes requested in the mark command
                        .filter_map(|axis| {
                            args.axes.remove(&axis.address).map(|direction|
                                MarkAxis {
                                    address: axis.address.clone(),
                                    target_position: axis.target_position,
                                    forward: direction.forward,
                                }
                            )
                        })
                        .collect();

                    if !args.axes.is_empty() {
                        warn!("WaitToReachMark macro axes not found: {:?}", args.axes);
                    }

                    self.mark = Some(Mark::WaitingToReachMark(mark));
                    self.poll_for = Some(Polling::PollPosition);
                } else {
                    Err(eyre::eyre!("Cannot wait to reach mark if mark is not set"))?;
                };
            },
        };

        self.despool(effects, context)
    }

    fn poll_feedback(
        &mut self,
        effects: &mut Vec<Effect>,
        context: &mut Context,
        poll_for: Polling,
    ) {
        if
            poll_for == Polling::PollTemperature
            && self.capabilities.contains("AUTOREPORT_TEMP")
        {
            // Skip temperature polling if auto report temp is enabled
            return self.poll_feedback(effects, context, Polling::PollPosition)
        }

        let gcode = match poll_for {
            Polling::PollTemperature => "M105",
            Polling::PollPosition => "M114",
        };

        trace!("Despool: Polling ({:})", gcode);

        self.awaiting_polling_feedback = true;

        send_serial(
            effects,
            GCodeLine {
                gcode: gcode.to_string(),
                line_number: Some(self.next_serial_line_number),
                checksum: true,
            },
            context,
            true,
        );

        self.on_ok = OnOK::Despool;
        self.next_serial_line_number += 1;

        self.poll_for = match poll_for {
            Polling::PollTemperature => Some(Polling::PollPosition),
            Polling::PollPosition => None,
        };
    }

    fn tickle_serial_port(mut self, context: &mut Context) -> Loop {
        let response_timeout_tickle_attempts = context.controller.model.response_timeout_tickle_attempts;
        let checksum_tickles = context.controller.model.checksum_tickles;

        if self.tickles_attempted >= response_timeout_tickle_attempts {
            let message = "Serial port communication timed out.".to_string();
            errored(message, &Ready(self), context)
        } else {
            warn!("Warning: GCode acknowledgement not received. Attempting to continue.");

            let mut effects = vec![];

            // Send M105 without a line number or a checksum. This should cause the
            // printer to return an "OK" and then the line number will be correct
            // unless a line has been missed (in which case we are in an error state
            // and the print will then be aborted by a firmware line number error as it should be).
            //
            // Should be equivalent to Octoprint's tickle logic:
            // https://github.com/foosel/OctoPrint/blob/master/src/octoprint/util/comm.py#L2302
            send_serial(
                &mut effects,
                GCodeLine {
                    // gcode: format!("M110 N{:}", self.next_serial_line_number - 1),
                    gcode: format!("M105"),
                    line_number: None,
                    checksum: checksum_tickles,
                },
                context,
                false,
            );

            self.tickles_attempted += 1;

            Loop::new(Ready(self), effects)
        }
    }

    fn receive_resend_request(mut self, line_number: u32, context: &mut Context) -> Loop {
        let sent_line_number = self.next_serial_line_number - 1;

        /*
        * Teg only sends one line at a time. If a resend is requested for a
        * different line number then this is likely an issue of the printer's
        * firmware.
        */
        if line_number != sent_line_number {
            let message = format!(
                "resend line number {:?} does not match sent line number {:?}",
                line_number,
                sent_line_number,
            );

            errored(message, &Ready(self), context)
        } else {
            // wait for the ok sent after the resend (see marlinFixture.js)
            self.on_ok = OnOK::Resend;

            Ready(self).and_no_effects()
        }
    }
}
