const getDriverConfig = (config) => {
  if (config == null) return null
  return config.get(config.machine.driver)
}

export default getDriverConfig
