import { Map } from 'immutable'
import { createSelector } from 'reselect'

import getPlugin from './getPlugin'

const getPluginsByMacroName = createSelector((config) => {
  const { macros } = config.configForm
  const pluginsByMacroName = {}
  Object.entries(macros).forEach(([pluginName, opts]) => {
    const plugin = getPlugin(config)(pluginName)

    Object.entries(plugin)
      .filter(([name]) => opts.includes('*') || opts.includes(name))
      .forEach(([name]) => {
        pluginsByMacroName[name] = plugin
      })
  })

  return Map(pluginsByMacroName)
})

export default getPluginsByMacroName
