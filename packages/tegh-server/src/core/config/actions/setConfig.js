import { isImmutable } from 'immutable'

import ConfigForm from '../types/ConfigForm'
import getPluginManager from '../selectors/getPluginManager'

export const BEFORE_SET_CONFIG = 'tegh/config/BEFORE_SET_CONFIG'

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

    const payload = {
      configForm: isImmutable(configForm) ? configForm : ConfigForm(configForm),
      patch,
    }

    await dispatch({
      type: BEFORE_SET_CONFIG,
      payload,
    })

    await dispatch({
      type: SET_CONFIG,
      payload,
    })

    /* unload old plugins after the action */
    // eslint-disable-next-line no-underscore-dangle
    getPluginManager._cache.delete(previousConfig)
  }
)

export default setConfig
