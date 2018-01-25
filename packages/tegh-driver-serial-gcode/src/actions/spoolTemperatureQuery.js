import { createSpoolAction } from 'tegh-daemon'

const spoolTemperatureQuery = () => {
  return createSpoolAction({
    internal: true,
    priority: 'preemptive',
    data: ['M105'],
  })
}

export default spoolTemperatureQuery
