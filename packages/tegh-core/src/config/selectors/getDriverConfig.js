import { createSelector } from 'reselect'

const getDriverConfig = createSelector(
  config => config,
  (config) => {
    if (config == null) return null

    const driverPackage = config.machine.driver
    return config.getIn(['plugins', driverPackage, 'settings'], null)
  },
)

export default getDriverConfig
