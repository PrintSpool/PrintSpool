import { createSelector } from 'reselect'

const getDriverConfig = createSelector(
  config => config,
  (config) => {
    if (config == null) return null
    const driverPlugin = config.getIn(['machine', 'driver'])
    return config.getIn(['plugins', driverPlugin])
  },
)

export default getDriverConfig
