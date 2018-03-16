import { spoolTask } from 'tegh-server'
import { PriorityEnum } from 'tegh-server'
const { PREEMPTIVE } = PriorityEnum

const name = 'spoolTemperatureQuery'

const spoolTemperatureQuery = () => {
  return spoolTask({
    name,
    internal: true,
    priority: PREEMPTIVE,
    file: {
      content: 'M105',
    }
  })
}

export default spoolTemperatureQuery
