import getPluginManager from './getPluginManager'

const getPlugin = config => (plugin) => {
  const manager = getPluginManager(config.configForm)
  if (!manager.isReady()) {
    const err = 'Attempted to load plugins before plugin manager was ready'
    throw new Error(err)
  }

  return manager.pluginCache[plugin]
}

export default getPlugin
