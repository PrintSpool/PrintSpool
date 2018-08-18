export const SET_PLUGIN_CACHE = 'tegh/pluginManager/SET_PLUGIN_CACHE'

const setPluginCache = cache => ({
  type: SET_PLUGIN_CACHE,
  payload: {
    cache,
  },
})

export default setPluginCache
