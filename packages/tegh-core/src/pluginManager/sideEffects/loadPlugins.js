import { Map } from 'immutable'

const loadPlugins = async (params) => {
  const { pluginLoader } = params
  let { config } = params

  if (pluginLoader == null) {
    throw new Error('pluginLoaderPath must be defined')
  }

  let plugins = Map()
  // eslint-disable-next-line no-restricted-syntax
  await Promise.all(
    config.plugins.map(async (pluginConfig, index) => {
      // eslint-disable-next-line no-await-in-loop
      const plugin = await pluginLoader(pluginConfig.package)
      // Load the plugin's extendedConfig type
      if (plugin.extendedConfig != null && plugin.ExtendedConfig != null) {
        const extendedConfig = plugin.ExtendedConfig(pluginConfig.settings)
        config = config.setIn(
          ['plugins', index, 'extendedConfig'],
          extendedConfig,
        )
      }
      // eslint-disable-next-line no-await-in-loop
      plugins = plugins.set(pluginConfig.package, plugin)
    }),
  )

  return { config, plugins }
}

export default loadPlugins
