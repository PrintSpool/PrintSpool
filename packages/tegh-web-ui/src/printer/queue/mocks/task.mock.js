const taskMock = (attrs = {}) => ({
  name: 'gear.gcode',
  percentComplete: 30,
  startedAt: '2018-03-20T01:19:35.646Z',
  status: 'PRINTING',
  machine: { name: 'Lulzbot' },
  ...attrs,
})

export default taskMock

export const gear = taskMock()

export const yCarriage = taskMock({
  name: 'x_carriage.gcode',
  machine: { name: 'Prusa i3' },
})

export const xCarriage = taskMock({
  name: 'y_carriage.gcode',
  machine: { name: 'MakerGear 3' },
})
