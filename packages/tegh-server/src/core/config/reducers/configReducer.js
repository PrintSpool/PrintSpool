import { Record } from 'immutable'

import getPluginsByMacroName from '../selectors/getPluginsByMacroName'
import { BEFORE_SET_CONFIG } from '../actions/setConfig'
import { SET_PLUGIN_LOADER_PATH } from '../actions/setPluginLoaderPath'

const initialState = Record({
  isInitialized: false,
  pluginLoaderPath: null,
  /*
   * The configForm is a map of all the configurations that are user-visible.
   * automatically configured properties should be put elsewhere.
   */
  configForm: null,
  /* HTTP Port / Unix Socket configuration */
  server: null,
})()

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

      let nextState = state.merge({
        isInitialized: true,
        configForm,
      })

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
