import getPlugin from './getPlugin'

const getDriver = (config) => {
  if (config == null) return null
  return getPlugin(config)(config.driver.package)
}

export default getDriver
