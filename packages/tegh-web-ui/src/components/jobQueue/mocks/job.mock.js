import { xCarriage, yCarriage } from './task.mock.js'

const JobMock = attrs => ({
  id: '123',
  name: 'gear.gcode',
  quantity: 1,
  tasksCompleted: 0,
  totalTasks: 1,
  status: 'QUEUED',
  stoppedAt: null,
  tasks: [],
  ...attrs,
})

export const gear = JobMock()

export const reprap = JobMock({
  id: 'reprap',
  name: 'reprap.zip',
  quantity: 2,
  tasksCompleted: 3,
  totalTasks: 10,
  status: 'PRINTING',
  tasks: [
    xCarriage,
    yCarriage,
  ],
})

export const drinkingGlass = JobMock({
  id: 'glass',
  name: 'drinking-glass_3.gcode',
  quantity: 2,
  tasksCompleted: 2,
  totalTasks: 2,
  status: 'DONE',
})

export const robot = JobMock({
  id: 'robot',
  name: (
    'robot_head.gcode, robot_lower_arm.gcode, robot_upper_arm.gcode'+
    'robot_torso.gcode, robot_wrist.gcode, gear_4.gcode, gear1.gcode, '+
    'robot_hand.gcode'
  ),
  quantity: 1,
  tasksCompleted: 0,
  totalTasks: 3,
  status: 'QUEUED',
})
