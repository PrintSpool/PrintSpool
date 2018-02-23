import { spoolTask } from 'tegh-server'

const spoolTemperatureQuery = () => {
  return spoolTask({
    internal: true,
    priority: 'preemptive',
    file: {
      content: 'M105',
    }
  })
}

export default spoolTemperatureQuery
