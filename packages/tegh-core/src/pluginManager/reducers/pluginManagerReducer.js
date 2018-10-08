import { Record, Map, isImmutable } from 'immutable'
import immutablePatch from 'immutablepatch'
import { loop, Cmd } from 'redux-loop'

import loadPlugins from '../sideEffects/loadPlugins'

import getPluginsByMacroName from '../selectors/getPluginsByMacroName'

import Config, { validateCoreConfig } from '../../config/types/Config'

import setConfig, { SET_CONFIG } from '../../config/actions/setConfig'
import { INITIALIZE_CONFIG } from '../../config/actions/initializeConfig'
import requestSetConfig, { REQUEST_SET_CONFIG } from '../../config/actions/requestSetConfig'
import { REQUEST_PATCH_CONFIG } from '../../config/actions/requestPatchConfig'

export const initialState = Record({
  pluginLoaderPath: null,
  cache: Map(),
})()

/*
 * manages the loading of Tegh plugins
 */
const pluginManagerReducer = (state = initialState, action) => {
  switch (action.type) {
    case INITIALIZE_CONFIG: {
      const { config, pluginLoaderPath } = action.payload

      const nextState = state.set('pluginLoaderPath', pluginLoaderPath)

      return loop(
        nextState,
        Cmd.action(
          requestSetConfig({ config }),
        ),
      )
    }
    case REQUEST_SET_CONFIG:
    case REQUEST_PATCH_CONFIG: {
      let { config } = action.payload

      if (action.type === REQUEST_PATCH_CONFIG) {
        config = immutablePatch(state.config, action.payload.patch)
      }

      if (!isImmutable(config)) config = Config(config)

      validateCoreConfig(config)

      return loop(state, Cmd.run(loadPlugins, {
        args: [{
          pluginLoaderPath: state.pluginLoaderPath,
          config,
        }],
        successActionCreator: setConfig,
      }))
    }
    case SET_CONFIG: {
      const {
        plugins,
        config,
      } = action.payload
      /*
       * validate plugin configurations on SET_CONFIG
       */
      plugins.forEach((plugin) => {
        if (plugin.validateConfig) plugin.validateConfig(config)
      })

      /*
       * run the getPluginsByMacroName selector to validate that all the macros
       * are valid
       */
      getPluginsByMacroName(action.payload)

      return state
    }
    default: {
      return state
    }
  }
}

export default pluginManagerReducer
