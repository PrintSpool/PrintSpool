import memoize from 'fast-memoize'

/*
 * This selector contains all the code for loading Tegh plugins.
 */
const getPluginManager = (config) => {
  let initialized = false
  const pluginCache = {}

  const preloadAllPlugins = async () => {
    if (config == null) {
      throw new Error('config cannot be null')
    }
    const { pluginLoaderPath } = config

    if (pluginLoaderPath == null) {
      throw new Error('pluginLoaderPath must be defined')
    }

    const loadPlugin = await import(pluginLoaderPath)

    const loadPluginToCache = async (plugin) => {
      pluginCache[plugin.package] = await loadPlugin(plugin.package)
    }

    await loadPluginToCache(config.driver)

    // eslint-disable-next-line no-restricted-syntax
    for (const plugin of config.plugins) {
      // eslint-disable-next-line no-await-in-loop
      await loadPluginToCache(plugin)
    }

    initialized = true
  }

  return {
    preloadAllPlugins,
    pluginCache,
    isReady: () => initialized,
  }
}

export default memoize(getPluginManager)
