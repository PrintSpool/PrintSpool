import linuxcnc
import socket
import sys
import uuid
from time import sleep

import combinator_protobuf
import machine_protobuf

MAX_COMBINATOR_MSG_SIZE = 16 * 1024

# Connect to LinuxCNC
cnc = linuxcnc.command()

# Create a unix domain socket to the localhost combinator
sock = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)

# Connect the socket to the port where the server is listening
socket_address = "./uds_socket"
print >>sys.stderr, "connecting to %s" % socket_address

try:
    sock.connect(server_address)
except socket.error, msg:
    print >>sys.stderr, msg
    sys.exit(1)

all_events = []
new_events = []

current_task = None
lastMachineUpdate = 0

## TODO: Startup


function add_event(type, task_id = None) {
    if task_id == None && current_task != None:
        task_id = current_task["id"]

    event = {
        "id": uuid.uuid4(),
        "type": type,
        "created_at": time.time(),
        "task_id": task_id
    }
    new_events.push(event)
    all_events.push(event)
}

# Main loop
while(true) {
    readable, writable, exceptional = select.select([socket], [socket], [socket])

    if (readable.len != 0) {
        # Only do a blocking read when a message is available
        interpretCombinatorMessage()
    }
    if (writable.len != 0 && lastMachineUpdate + 200 * 1000 < time.time()) {
        # Only create a machine update when an update can be sent over the
        # socket. Rate limited to one update every 200ms.
        createMachineUpdate()
    }
    if (exceptional.len != 0) {
        print >>sys.stderr, "Unknown Teg Socket Error"
        sys.exit(1)
    }
    if (readable.len == 0 && writable.len == 0) {
        # Wait 50ms and then check if there's anything to do again.
        sleep(0.05)
    }
}

interpretCombinatorMessage() {
    # Receive combinator messages
    msg = combinator_protobuf.CombinatorMessage()
    msg.ParseFromString(socket.recv(MAX_COMBINATOR_MSG_SIZE))
    type = msg.WhichOneof("payload")

    # Interpretter
    if (type == "new_connection") {
        # TODO: new connection process
    } elif (type == "set_config") {
        # This machine implementation does not load anything from the configuration
    } elif (type == "spool_task") {
        if (msg.spool_task.override) {
            commands = open(msg.spool_task.file_path, "r").read().split('\n')
            # Update the task history
            add_event(machine_protobuf.EventType.START_TASK, msg.spool_task.task_id)
            # c.mode(linuxcnc.MODE_MDI)
            # c.wait_complete() # wait until mode switch executed
            for command in commands:
                c.mdi()
                c.wait_complete() # wait until mode command executed
            # if (current_task != None): {
            #     c.mode(linuxcnc.MODE_AUTO)
            #     c.wait_complete() # wait until mode switch executed
            # }
            # Update the task history
            add_event(machine_protobuf.EventType.FINISH_TASK, msg.spool_task.task_id)
        } else {
            # Start the task
            cnc.mode(linuxcnc.MODE_AUTO)
            cnc.wait_complete() # wait until mode switch executed
            cnc.program_open(msg.file_path)
            cnc.auto(linuxcnc.AUTO_RUN, 0)

            current_task = {
                "id": msg.spool_task.task_id,
                "name": msg.spool_task.name,
                "file_path": msg.spool_task.file_path
            }

            # Update the task history
            add_event(machine_protobuf.EventType.START_TASK)
        }
    } elif (type == "estop") {
        cnc.estop()

        # Update the task history
        add_event(machine_protobuf.EventType.CANCEL_TASK)

        current_task = None
    } elif (type == "delete_task_history") {
        event_filter = lambda x: !msg.task_ids.includes(x.task_id)

        all_events = list(filter(event_filter, all_events))
        new_events = list(filter(event_filter, new_events))
    } else {
        print >>sys.stderr, "Unrecognized message type %s" % type
    }
}

createMachineUpdate() {
    # Feedback/Update from linuxCNC
    stat = None
    try:
        stat = linuxcnc.stat() # create a connection to the status channel
        s.poll() # get current values
    except linuxcnc.error, detail:
        print "error", detail
        sys.exit(1)

    msg = machine_protobuf.MachineMessage()
    feedback = msg.feedback.add()

    buildTaskUpdate(stat, feedback)
    buildMachineOperationUpdate(stat, feedback)

    lastMachineUpdate = time.time()
}

buildTaskUpdate(stat, feedback) {
    if (current_task != None) {
        if (stat.file != current_task["file"]) {
            print >>sys.stderr, 'Unexpected file change: %s' % stat.file
            sys.exit(1)
        }

        if (
            stat.exec_state == 'EXEC_ERROR'
            || cnc.stat.exec_state == 'EXEC_DONE'
        ) {
            if (cnc.stat.exec_state == 'EXEC_ERROR'):
                add_event(machine_protobuf.EventType.ERROR)
            else:
                add_event(machine_protobuf.EventType.FINISH_TASK)

            current_task = None
            cnc.reset_interpreter()
        } else {
            # Task is still running
            feedback.despooled_line_number = stat.current_line
        }
    }
    for event in new_events:
        ev = feedback.add_event()
        ev.id = event.id
        ev.task_id = event.task_id
        ev.type = event.type
        ev.created_at = event.created_at
}

AXES = "xyzabcuvw"

buildMachineOperationUpdate(stat, feedback) {
    # Axis positions
    for i in range(len(AXES)):
        axis = feedback.axis.add()
        axis.address = AXES[i]

        if (len(stat.position) > i) {
            axis.target_position = stat.position[i]
        }
        if (len(stat.actual_position) > i) {
            axis.actual_position = stat.actual_position[i]
        }
        if (len(stat.axis) > i) {
            axis.homed = stat.axis[i]['homed']
        }

    # Heaters not implemented

    # Spindle speed controller
    spindle = feedback.speed_controllers.add()
    spindle.id = 'spindle'
    spindle.target_speed = stat.spindle_speed
    spindle.enabled = stat.spindle_enabled
}
