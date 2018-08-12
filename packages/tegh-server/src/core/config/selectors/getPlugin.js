import getPluginManager from './getPluginManager'

const getPlugin = config => (plugin) => {
  const manager = getPluginManager(config.configForm)
  if (!manager.isReady()) {
    const err = `Attempted to load plugin ${plugin} before plugin manager`
    throw new Error(err)
  }

  return manager.pluginCache[plugin]
}

export default getPlugin
