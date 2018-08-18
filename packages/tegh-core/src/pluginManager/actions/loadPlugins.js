export const LOAD_PLUGINS = 'tegh/pluginManager/LOAD_PLUGINS'

const loadPlugins = plugins => ({
  type: LOAD_PLUGINS,
  payload: {
    plugins,
  },
})

export default loadPlugins
