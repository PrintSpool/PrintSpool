import { getDriverConfig } from 'tegh-core'

const getPollingInterval = config => (
  getDriverConfig(config).temperaturePollingInterval
)

export default getPollingInterval
