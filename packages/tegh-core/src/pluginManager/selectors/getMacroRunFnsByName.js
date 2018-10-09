import { Map } from 'immutable'
import { createSelector } from 'reselect'

const getMacroRunFnsByName = createSelector(
  state => state,
  ({ config, plugins }) => {
    const { macros } = config
    const macroRunFnsByName = {}

    macros.entries().forEach(([pluginName, opts]) => {
      const plugin = plugins.get(pluginName)

      plugin.macros.entires()
        .filter(([name]) => opts.includes('*') || opts.includes(name))
        .forEach(([name, runFn]) => {
          macroRunFnsByName[name] = runFn
        })
    })

    return Map(macroRunFnsByName)
  },
)

export default getMacroRunFnsByName
