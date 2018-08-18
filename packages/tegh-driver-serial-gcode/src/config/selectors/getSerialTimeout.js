import { getDriverConfig } from 'tegh-core'

const getSerialTimeout = config => (
  getDriverConfig(config).serialTimeout
)

export default getSerialTimeout
