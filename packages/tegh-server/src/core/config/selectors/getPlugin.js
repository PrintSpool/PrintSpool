const getPlugin = config => (plugin) => {
  if (config == null) return null
  const { pluginLoaderPath } = config
  if (pluginLoaderPath == null) return null
  return import(pluginLoaderPath)(plugin)
}

export default getPlugin
