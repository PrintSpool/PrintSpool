import { Record, Map } from 'immutable'
import { loop, Cmd } from 'redux-loop'

import preloadAllPlugins from '../sideEffects/preloadAllPlugins'

import getPluginsByMacroName from '../selectors/getPluginsByMacroName'

import { SET_CONFIG } from '../../config/actions/setConfig'
import { SET_PLUGIN_LOADER_PATH } from '../actions/setPluginLoaderPath'
import { REQUEST_LOAD_PLUGINS } from '../actions/requestLoadPlugins'
import setPluginCache, { SET_PLUGIN_CACHE } from '../actions/setPluginCache'
import loadPlugins from '../actions/loadPlugins'

const initialState = Record({
  pluginLoaderPath: null,
  cache: Map(),
})()

/*
 * manages the loading of Tegh plugins
 */
const pluginManagerReducer = (state = initialState, action) => {
  switch (action) {
    case SET_PLUGIN_LOADER_PATH: {
      return state.set('pluginLoaderPath', action.payload.pluginLoaderPath)
    }
    case REQUEST_LOAD_PLUGINS: {
      const { config } = action

      return loop(state, Cmd.action(preloadAllPlugins(config), {
        args: [
          state.pluginLoaderPath,
          config.plugins,
        ],
        successActionCreator: setPluginCache,
      }))
    }
    case SET_PLUGIN_CACHE: {
      const nextState = state.set('cache', action.payload.cache)

      return loop(nextState, Cmd.action(loadPlugins(nextState.cache.keys())))
    }
    case SET_CONFIG: {
      /*
       * validate plugin configurations on SET_CONFIG
       */
      state.cache.forEach((plugin) => {
        if (plugin.validateConfig) plugin.validateConfig(action.config)
      })

      /*
       * run the getPluginsByMacroName selector to validate that all the macros
       * are valid
       */
      getPluginsByMacroName(action.config)

      return state
    }
    default: {
      return state
    }
  }
}

export default pluginManagerReducer
