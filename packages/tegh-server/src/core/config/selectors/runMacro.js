import { createSelector } from 'reselect'

import getPluginsByMacroName from './getPluginsByMacroName'

const runMacro = createSelector(
  [
    config => config,
    getPluginsByMacroName,
  ],
  (config, pluginsByMacroName) => (macro, args) => {
    const macroRunFn = pluginsByMacroName.get(macro)[macro]
    if (macroRunFn == null) {
      throw new Error(`Macro ${macro} does not exist`)
    }
    macroRunFn(args, config)
  },
)

export default runMacro
