import { Map, List } from 'immutable'

import { SET_CONFIG } from '../actions/setConfig'

// a nested map of machineID => macroName => macro
export const initialState = Map()

const macrosReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const {
        config,
        plugins,
      } = action.payload

      return config.machines.map((machine) => {
        let macros = Map()

        machine.plugins.forEach((pluginConfig) => {
          const enabledMacros = pluginConfig.getIn(['model', 'macros'], [])

          const plugin = plugins.get(pluginConfig.package)
          const pluginMacros = List(plugin.macros || [])
            .toMap()
            .mapKeys((_, macro) => macro.key)

          if (enabledMacros.includes('*')) {
            macros = macros.merge(pluginMacros)
          } else {
            enabledMacros.forEach((macroName) => {
              macros = macros.set(macroName, pluginMacros.get(macroName))
            })
          }
        })

        return macros
      })
    }
    default: {
      return state
    }
  }
}

export default macrosReducer
