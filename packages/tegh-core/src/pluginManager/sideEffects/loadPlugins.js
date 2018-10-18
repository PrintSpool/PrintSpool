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
    config.plugins.map(async (pluginConfig) => {
      // eslint-disable-next-line no-await-in-loop
      const plugin = await pluginLoader(pluginConfig.package)
      // Load the plugin's configuration into it's Settings type
      if (plugin.Settings != null) {
        const settings = plugin.Settings(pluginConfig.settings)
        config = config.setIn(
          ['plugins', pluginConfig.package, 'settings'],
          settings,
        )
      }
      // eslint-disable-next-line no-await-in-loop
      plugins = plugins.set(pluginConfig.package, plugin)
    }),
  )

  return { config, plugins }
}

export default loadPlugins
