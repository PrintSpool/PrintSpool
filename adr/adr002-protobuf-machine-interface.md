### Design Goals

* Split the server into 2 parts:
  * the `machine` process - responsible for driving the gcode spooling loop
  * the `combinator` process - responsible for storing the job queue, configuration data, relaying webcam footage and presenting the public GraphQL API
* Both the machine and the combinator MUST be able to crash independently without effecting the operation of the other.
  * the machine MUST be able to relay changes back to the new combinator process after a combinator crash
  * the combinator SHOULD mark the job as errored in the event of a machine crash
* Both remote machines and combinators MUST be designed to gracefully handle network disconnects in case they are not running on the same machine
* Where possible idempotent communication should be used to reduce implementation difficulty in deduplicating data.

### Architecture
Use WebRTC for remote machines and Unix Sockets for local machines.

DEPRICATED: https://github.com/nickdesaulniers/node-nanomsg

* A machine has 1 pair IPC socket connecting it to a localhost combinator.
* A combinator can attach to many pair IPC sockets for localhost machines.
* A combinator can serve many WebRTC clients to act as a reverse proxy to localhost machines.
* A combinator can connect to many remote combinators over WebRTC to access their proxied remote machines.

The combinator handles load balancing in Javascript to allow flexibility in deciding which
machine to run a print on.

The only scenario in which a unix socket should be disconnected from is if either the localhost combinator or machine has crashed.

NEW_SOCKET actions are used to indicate when a unix socket connection is re-established.

All sockets are assumed to be reliable until a NEW_SOCKET action is received. Once the NEW_SOCKET action is received:
- If the Combinator sent the NEW_SOCKET it is assumed that any available data sent to the combinator has been lost and should be resent.
- If the Machine sent the NEW_SOCKET it is assumed that the state of the machine has been wiped and will need to be reset by the localhost Combinator.

#### Sending Combinator Messages to Machines

All actions from the Combinator wait for an ACK before sending the next action.

Only the NEW_SOCKET action from the machine waits for an ACK before sending the next action.

Actions from all Combinators:
* ACK
* SET_CONFIG
* SPOOL_TASK
* ESTOP
* DELETE_JOB_HISTORY

#### Sending Machine Messages to Combinators

Actions from all Machines:
* ACK
* `events`
* PRINTER_STATUS_CHANGE (printer connect, disconnect, estopped, reset)

Actions sent only to localhost Combinators:
* FEEDBACK
* SET_TASK_LINE_NUMBER - a rate limited update on the current line number of the task.

Further Notes:

Since the GraphQL API must provide a gcodeHistory reliably the GCODE_FEEDBACK needs to be sent over a reliable channel and one action must be for each GCode executed.

The job history events need to be pushed through a reliable socket so that in the case of a temporary network disconnect or back pressure on the socket the combinator is guaranteed to receive the job history event.

#### Startup Workflow
* On startup the local combinator and machine connect their pair sockets.
  * The machine binds the socket
  * The combinator connects to the machine's socket.
  * Note: The combinator's initial call to `connect` will block until the machine has bound it's end of the socket but if the machine crashes then the combinator will maintain it's smart socket while the machine restarts.
* When the machine starts up it will send a `MachineStartup` action to the combinator.
  * If the combinator is listening then it will reset it's connection to the machine
  * If the combinator is not yet listening then it is in the startup process as well and a new connection will be established once the combinator is initialized.
* When the combinator resets it's connection to the machine or starts a new connection it sends a `ResetConnection`.
  * Upon startup the machine ignores all messages until `ResetConnection` is received.
* Upon receiving a `ResetConnection` the machine sends it's complete job history with a `events` action. This will always include the MACHINE_START_UP event but a PRINT_ERROR may be included as well *before* the MACHINE_START_UP event in the event that the machine had a fatal error that was saved to disk before it crashed and re-hydrated on startup.
* If the only event in a `events` payload is the MACHINE_START_UP event then the local combinator will cancel any pending requests, set it's internal state of the machine to START_UP and sends a SET_CONFIG action initializing the machine's configuration.
* If the state is set to START_UP the user will need to verify that the build platform is clear before resetting the machine. Resetting the machine will set the state to IDLE internally in the combinator but does not effect the machine in any way since the START_UP state only exists to prevent user mistakes in not clearing the build platform before stating a print.
* Resetting the state from START_UP will delay until the machine has received it's initial configuration.

#### Configuration Workflow
* Upon changing the configuration the combinator validates the new config with json schema forms and defers relaying it to the machine until the machine is not printing a job.
* If the state is PRINTING the UI should indicate that "Some changes may not be applied until after the current print" in the configuration form.
* Once the machine is IDLE the combinator will send a SET_CONFIG event with the new configuration and mark the configuration as no longer pending.

#### Job Workflow
* Upon starting a job the combinator sends a SPOOL_TASK action to the machine
* Upon receiving a SPOOL_TASK action the machine sends a `events` action with a SPOOL_PRINT event. The machine may also send a START_PRINT event if it is ready to start the print immediately or send another `events` action later when it is ready to start the print.
* Upon canceling, erroing or finishing the job the combinator sends a `events` with CANCEL_PRINT, PRINT_ERROR or FINISH_PRINT respectively. Some fatal errors may cause the error to send only a MACHINE_START_UP event. If a print is ongoing a MACHINE_START_UP event should be treated as a print failure.
* Upon receiving a `events` action the combinator filters out and job history events that are not relevant to it. If the combinator is the machine's local host (and therefore also acting as a reverse proxy for the machine to other networked combinators) then it keeps all job history events so they can be forwarded through the proxy.
* Upon receiving a job history event that indicates the completion of the print (successful or not) the machine first persists the job history and then sends a DELETE_JOB_HISTORY action to the machine for the jobID that was completed.

#### Machine Errors
When the machine starts up it sends a MACHINE_START_UP job history event. This allows the combinator to treat situations in which the machine shuts down mid job without being able to record anything about it's previous state such as a machine power outage as a job failure.

Every MACHINE_START_UP event should set the state to "START_UP" which is treated similar to an error so that if a print was started that the combinator was not aware of (for example from another combinator or from this combinator but it crashed as it was persisting the JOB_START event) then the combinator will not collide with the existing object on the build platform from the "forgotten" print.

MACHINE_START_UP errors should be relayed to the user with the message: "The machine has restarted and may have objects on it's build platform. Please verify that the build platform is clear before clicking reset."

In the case of a non-fatal error the machine is expected to send a ERROR job history event. The combinator treats the ERROR event as a job failure and relays the error message to the user.

If an ERROR event is sent with the MACHINE_START_UP event then the error message presented to the user is the one provided by the ERROR event.

If the machine is able to record a fatal error as it is in the process of crashing it should send a ERROR job history event followed by a MACHINE_START_UP job history event upon starting back up.

#### Combinator Errors

Combinator errors should be displayed over top of the Job Queue UI. Combinator errors should be able to be cleared by the user.

#### Networking Machines / Proxying Machines through Combinators

Combinators can proxy machine NanoMsg data over WebRTC to other Combinators so that many machines may be controlled across the network from a single job queue.

WebRTC connections use labels to seperate a GraphQL server and Machine NanoMsg data into seperate channels. The client determines which channels to connect to so web users do not receive unecessary nanomsg spam.

WebRTC connections MUST use the following labels:
* "graphql" for the GraphQL server
* "nanomsg:$MACHINE_ID" for each machine proxy where $MACHINE_ID is the globally unique ID of the machine listed in it's configuration. For example a machine proxy label might look like: "nanomsg:123e4567-e89b-12d3-a456-426655440000".

#### Further Thoughts
* It might be useful to be able to set the state to "NETWORK_DISCONNECTED" when a network disconnect has occurred.
