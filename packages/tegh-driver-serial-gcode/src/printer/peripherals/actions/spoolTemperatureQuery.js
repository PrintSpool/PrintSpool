import { spoolTask } from 'tegh-server'
import { PriorityEnum } from 'tegh-server'

const { PREEMPTIVE } = PriorityEnum

const name = 'spoolTemperatureQuery'

const spoolTemperatureQuery = () => spoolTask({
  name,
  internal: true,
  priority: PREEMPTIVE,
  data: ['M105'],
})

export default spoolTemperatureQuery
