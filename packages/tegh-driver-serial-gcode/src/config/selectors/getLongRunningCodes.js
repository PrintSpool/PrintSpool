import { getDriverConfig } from 'tegh-core'

const getLongRunningCodes = config => (
  getDriverConfig(config).longRunningCodes
)

export default getLongRunningCodes
