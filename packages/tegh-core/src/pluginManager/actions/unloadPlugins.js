export const UNLOAD_PLUGINS = 'tegh/pluginManager/UNLOAD_PLUGINS'

const unloadPlugins = plugins => ({
  type: UNLOAD_PLUGINS,
  payload: {
    plugins,
  },
})

export default unloadPlugins
