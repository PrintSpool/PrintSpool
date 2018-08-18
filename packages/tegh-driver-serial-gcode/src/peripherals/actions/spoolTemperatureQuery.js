import { spoolTask, PriorityEnum } from 'tegh-core'

const { PREEMPTIVE } = PriorityEnum

const spoolTemperatureQuery = () => spoolTask({
  name: 'spoolTemperatureQuery',
  internal: true,
  priority: PREEMPTIVE,
  data: ['M105'],
})

export default spoolTemperatureQuery
