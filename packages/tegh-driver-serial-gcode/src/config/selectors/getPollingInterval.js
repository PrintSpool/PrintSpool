import { getDriverConfig } from 'tegh-server'

const getPollingInterval = config => (
  getDriverConfig(config).temperaturePollingInterval
)

export default getPollingInterval
