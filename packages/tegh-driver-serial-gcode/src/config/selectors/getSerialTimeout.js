import { getDriverConfig } from 'tegh-server'

const getSerialTimeout = config => (
  getDriverConfig(config).serialTimeout
)

export default getSerialTimeout
