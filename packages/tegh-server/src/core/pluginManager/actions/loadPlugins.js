export const LOAD_PLUGINS = 'tegh/pluginManager/LOAD_PLUGINS'

const loadPlugins = cache => ({
  type: LOAD_PLUGINS,
  payload: {
    cache,
    plugins: cache.keys(),
  },
})

export default loadPlugins
