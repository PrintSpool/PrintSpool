import { createSelector } from 'reselect'

import getPluginsByMacroName from './getPluginsByMacroName'

const getMacroRunFn = createSelector(
  state => getPluginsByMacroName(state),
  pluginsByMacroName => macro => pluginsByMacroName.get(macro)[macro],
)

export default getMacroRunFn
