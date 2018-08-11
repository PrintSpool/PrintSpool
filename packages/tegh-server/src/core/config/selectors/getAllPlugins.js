import getPluginManager from './getPluginManager'

const getAllPlugins = config => (plugin) => {
  const manager = getPluginManager(config)
  if (!manager.isReady()) {
    const err = (
      `Attempted to load plugin ${plugin} before plugin manager was ready`
    )
    throw new Error(err)
  }

  return manager.pluginCache
}

export default getAllPlugins
