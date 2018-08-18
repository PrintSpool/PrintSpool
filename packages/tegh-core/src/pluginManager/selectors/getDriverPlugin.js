import getPlugin from './getPlugin'

const getDriverPlugin = (config) => {
  if (config == null) return null
  return getPlugin(config)(config.machine.driver)
}

export default getDriverPlugin
