// returns a plain js object
const getAllPlugins = (config) => {
  if (!config.initialized) Map()

  return config.pluginManager.initialized.cache
}

export default getAllPlugins
