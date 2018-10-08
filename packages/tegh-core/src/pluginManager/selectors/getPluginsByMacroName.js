import { Map } from 'immutable'
import { createSelector } from 'reselect'

const getPluginsByMacroName = createSelector(
  state => state,
  ({ config, plugins }) => {
    const { macros } = config
    const pluginsByMacroName = {}
    Object.entries(macros).forEach(([pluginName, opts]) => {
      const plugin = plugins.get(pluginName)

      Object.entries(plugin)
        .filter(([name]) => opts.includes('*') || opts.includes(name))
        .forEach(([name]) => {
          pluginsByMacroName[name] = plugin
        })
    })

    return Map(pluginsByMacroName)
  },
)

export default getPluginsByMacroName
