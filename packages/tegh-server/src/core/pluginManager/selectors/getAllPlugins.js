// returns a plain js object
const getAllPlugins = (config) => {
  if (!config.initialized) {
    const err = 'Attempted to load plugins before SET_CONFIG'
    throw new Error(err)
  }

  return config.pluginManager.initialized.cache
}

export default getAllPlugins
