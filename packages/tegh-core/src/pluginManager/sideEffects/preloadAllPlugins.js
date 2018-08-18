const preloadAllPlugins = async (pluginLoaderPath, pluginConfigs) => {
  if (pluginLoaderPath == null) {
    throw new Error('pluginLoaderPath must be defined')
  }

  const load = await import(pluginLoaderPath)

  let cache = Map()
  // eslint-disable-next-line no-restricted-syntax
  for (const pluginConfig of pluginConfigs) {
    // eslint-disable-next-line no-await-in-loop
    const plugin = await load(pluginConfig.package)
    // eslint-disable-next-line no-await-in-loop
    cache = cache.set(pluginConfig.package, plugin)
  }
  return cache
}

export default preloadAllPlugins
