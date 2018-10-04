const getDriverConfig = (config) => {
  if (config == null) return null
  const driverPlugin = config.getIn(['machine', 'driver'])
  return config.getIn(['plugins', driverPlugin])
}

export default getDriverConfig
