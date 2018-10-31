import { Map } from 'immutable'
import { createSelector } from 'reselect'

const getMacroRunFnsByName = createSelector(
  state => state,
  ({ config, plugins }) => {
    const { macros } = config
    const macroRunFnsByName = {}

    macros.forEach((opts, pluginName) => {
      const plugin = plugins.get(pluginName) || {}

      Map(plugin.macros || {})
        .filter(name => opts.includes('*') || opts.includes(name))
        .forEach((runFn, name) => {
          macroRunFnsByName[name] = runFn
        })
    })

    return Map(macroRunFnsByName)
  },
)

export default getMacroRunFnsByName
