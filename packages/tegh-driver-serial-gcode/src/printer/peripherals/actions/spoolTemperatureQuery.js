import { spoolTask, PriorityEnum } from 'tegh-server'

const { PREEMPTIVE } = PriorityEnum

const spoolTemperatureQuery = () => spoolTask({
  name: 'spoolTemperatureQuery',
  internal: true,
  priority: PREEMPTIVE,
  data: ['M105'],
})

export default spoolTemperatureQuery
