export const PLUGINS_LOADED = 'tegh/pluginManager/PLUGINS_LOADED'

const pluginsLoaded = cache => ({
  type: PLUGINS_LOADED,
  payload: { cache },
})

export default pluginsLoaded
