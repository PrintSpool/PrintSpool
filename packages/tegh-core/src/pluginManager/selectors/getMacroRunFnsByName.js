import { createSelector } from 'reselect'

import getPluginsByMacroName from './getPluginsByMacroName'

const getMacroRunFnsByName = createSelector(
  state => getPluginsByMacroName(state),
  pluginsByMacroName => (
    pluginsByMacroName.map((plugin, macroName) => plugin[macroName])
  ),
)

export default getMacroRunFnsByName
