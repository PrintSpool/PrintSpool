import { xCarriage, yCarriage } from './task.mock'

const JobMock = attrs => ({
  id: '123',
  name: 'gear.gcode',
  quantity: 1,
  printsCompleted: 0,
  totalPrints: 1,
  isDone: false,
  stoppedAt: null,
  tasks: [],
  ...attrs,
})

export const gear = JobMock()

export const reprap = JobMock({
  id: 'reprap',
  name: 'reprap.zip',
  quantity: 2,
  printsCompleted: 3,
  totalPrints: 10,
  tasks: [
    xCarriage,
    yCarriage,
  ],
})

export const drinkingGlass = JobMock({
  id: 'glass',
  name: 'drinking-glass_3.gcode',
  quantity: 2,
  printsCompleted: 2,
  totalPrints: 2,
  isDone: true,
})

export const robot = JobMock({
  id: 'robot',
  name: (
    'robot_head.gcode, robot_lower_arm.gcode, robot_upper_arm.gcode'
    + 'robot_torso.gcode, robot_wrist.gcode, gear_4.gcode, gear1.gcode, '
    + 'robot_hand.gcode'
  ),
  quantity: 1,
  printsCompleted: 0,
  totalPrints: 3,
})
