import { createSelector } from 'reselect'

import getMacroRunFn from '../../pluginManager/selectors/getMacroRunFn'

const runMacro = createSelector(
  state => state,
  state => (macro, args) => {
    const macroRunFn = getMacroRunFn(state)(macro)
    if (macroRunFn == null) {
      throw new Error(`Macro ${macro} does not exist`)
    }
    return macroRunFn(args, state)
  },
)

export default runMacro
