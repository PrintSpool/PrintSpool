import { Map } from 'immutable'
import { createSelector } from 'reselect'

const getMacroRunFnsByName = createSelector(
  state => state,
  ({ config, plugins }) => {
    const macroRunFnsByName = {}

    config.printer.plugins.forEach((pluginConfig) => {
      const plugin = plugins.get(pluginConfig.package) || {}

      Map(plugin.macros || {})
        .filter(name => (
          pluginConfig.macros.includes('*')
          || pluginConfig.macros.includes(name)
        ))
        .forEach((runFn, name) => {
          macroRunFnsByName[name] = runFn
        })
    })

    return Map(macroRunFnsByName)
  },
)

export default getMacroRunFnsByName
