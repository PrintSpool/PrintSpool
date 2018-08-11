import setConfig from './setConfig'
import setPluginLoaderPath from './setPluginLoaderPath'

const initializeConfig = ({
  configForm,
  pluginLoaderPath,
}) => async (dispatch) => {
  await dispatch(setPluginLoaderPath({
    pluginLoaderPath,
  }))

  await dispatch(setConfig({
    configForm,
  }))
}

export default initializeConfig
