import Config, { validateConfig } from '../types/Config'

import getPluginsByMacroName from '../selectors/getPluginsByMacroName'
import { BEFORE_SET_CONFIG } from '../actions/setConfig'
import { SET_PLUGIN_LOADER_PATH } from '../actions/setPluginLoaderPath'

const initialState = Config()

const configReducer = (state = initialState, action) => {
  switch (action) {
    case SET_PLUGIN_LOADER_PATH: {
      return state.set('pluginLoaderPath', action.payload.pluginLoaderPath)
    }
    case BEFORE_SET_CONFIG: {
      const {
        configForm,
        server,
      } = action.payload

      let nextState = state
        .merge(configForm)
        .merge({
          isInitialized: true,
          configForm,
        })

      validateConfig(nextState)

      /*
       * run the getPluginsByMacroName selector to validate that all the macros
       * are valid
       */
      getPluginsByMacroName(nextState)

      if (server != null) {
        nextState = nextState.set('server', server)
      }

      return nextState
    }
    default: {
      return state
    }
  }
}

export default configReducer
