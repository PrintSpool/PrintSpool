export const SET_PLUGIN_LOADER_PATH = 'tegh/config/SET_PLUGIN_LOADER_PATH'

const setPluginLoaderPath = ({
  pluginLoaderPath,
}) => ({
  type: SET_PLUGIN_LOADER_PATH,
  payload: { pluginLoaderPath },
})

export default setPluginLoaderPath
