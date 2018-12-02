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
    config.printer.plugins.map(async (pluginConfig, index) => {
      // eslint-disable-next-line no-await-in-loop
      const plugin = await pluginLoader(pluginConfig.package)
      // Load the plugin's model type
      if (plugin.model != null && plugin.ExtendedConfig != null) {
        const model = plugin.ExtendedConfig(pluginConfig.settings)
        config = config.setIn(
          ['plugins', index, 'model'],
          model,
        )
      }
      // eslint-disable-next-line no-await-in-loop
      plugins = plugins.set(pluginConfig.package, plugin)
    }),
  )

  return { config, plugins }
}

export default loadPlugins
