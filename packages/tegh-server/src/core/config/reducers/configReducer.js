import { Record } from 'immutable'

import getPlugin from '../selectors/getPlugin'
import { SET_CONFIG } from '../actions/setConfig'
import { SET_PLUGIN_LOADER_PATH } from '../actions/setPluginLoaderPath'

const initialState = Record({
  pluginLoaderPath: null,
  macroPluginsByMacroName: Map(),
  /*
   * The configForm is a map of all the configurations that are user-visible.
   * automatically configured properties should be put elsewhere.
   */
  configForm: null,
})()

const configReducer = (state = initialState, action) => {
  switch (action) {
    case SET_PLUGIN_LOADER_PATH: {
      return state.set('pluginLoaderPath', action.payload.pluginLoaderPath)
    }
    case SET_CONFIG: {
      const { configForm } = action.payload

      // set config.macroPluginsByMacroName
      const macroPluginsByMacroName = {}
      Object.entries(configForm.get('macros')).forEach(([pluginName, opts]) => {
        const plugin = getPlugin(configForm)(pluginName)
        Object.entries(plugin)
          .filter(([name]) => opts === 'all' || opts.includes(name))
          .forEach(([name]) => {
            macroPluginsByMacroName[name] = pluginName
          })
      })

      return state.merge({
        configForm,
        macroPluginsByMacroName: Map(macroPluginsByMacroName),
      })
    }
    default: {
      return state
    }
  }
}

export default configReducer
