const getPlugin = config => (plugin) => {
  if (!config.initialized) {
    const err = `Attempted to load plugin ${plugin} before plugin manager`
    throw new Error(err)
  }

  return config.pluginManager.cache.get(plugin)
}

export default getPlugin
