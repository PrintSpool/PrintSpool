import getPluginManager from '../selectors/getPluginManager'

export const SET_CONFIG = 'tegh/config/SET_CONFIG'

const setConfig = ({
  configForm,
  patch = null,
}) => (
  async (dispatch, getState) => {
    const previousConfig = getState().config.configForm
    // TODO: dispatch an action to shut down the previous plugins

    /* load new plugins before the action */
    const pluginManager = getPluginManager(configForm)
    await pluginManager.preloadAllPlugins()

    const action = {
      type: SET_CONFIG,
      payload: {
        configForm,
        patch,
      },
    }

    await dispatch(action)

    /* unload old plugins after the action */
    // eslint-disable-next-line no-underscore-dangle
    getPluginManager._cache.delete(previousConfig)

    return action
  }
)

export default setConfig
