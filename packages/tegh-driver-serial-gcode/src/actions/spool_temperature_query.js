import { spoolAction } from 'tegh-daemon'

const spoolTemperatureQuery = () => {
  return spoolAction({
    spoolName: 'internalSpool',
    data: ['M105'],
  })
}

export default spoolTemperatureQuery
