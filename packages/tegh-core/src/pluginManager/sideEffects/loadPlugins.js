import { Map } from 'immutable'

const loadPlugins = async ({
  pluginLoaderPath,
  config,
}) => {
  if (pluginLoaderPath == null) {
    throw new Error('pluginLoaderPath must be defined')
  }

  const load = await import(pluginLoaderPath)

  let plugins = Map()
  // eslint-disable-next-line no-restricted-syntax
  await Promise.all(
    config.plugins.map(async (pluginConfig) => {
      // eslint-disable-next-line no-await-in-loop
      const plugin = await load(pluginConfig.package)
      // eslint-disable-next-line no-await-in-loop
      plugins = plugins.set(pluginConfig.package, plugin)
    }),
  )

  return { config, plugins }
}

export default loadPlugins
