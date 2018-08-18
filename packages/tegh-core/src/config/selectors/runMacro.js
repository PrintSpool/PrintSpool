import { createSelector } from 'reselect'

import getPluginsByMacroName from '../../pluginManager/selectors/getPluginsByMacroName'

const runMacro = createSelector(
  [
    state => state,
    state => getPluginsByMacroName(state.config),
  ],
  (state, pluginsByMacroName) => (macro, args) => {
    const macroRunFn = pluginsByMacroName.get(macro)[macro]
    if (macroRunFn == null) {
      throw new Error(`Macro ${macro} does not exist`)
    }
    macroRunFn(args, state)
  },
)

export default runMacro
