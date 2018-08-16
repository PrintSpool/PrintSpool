import { getDriverConfig } from 'tegh-server'

const getLongRunningCodes = config => (
  getDriverConfig(config).longRunningCodes
)

export default getLongRunningCodes
