import { Record } from 'immutable'
import { createSelector } from 'reselect'

import getPluginsByMacroName from '../../pluginManager/selectors/getPluginsByMacroName'

const getMacroDefintions = createSelector(
  getPluginsByMacroName,
  pluginsByMacroName => (
    pluginsByMacroName.values().map(macro => (
      Record({ name: macro })()
    ))
  ),
)

export default getMacroDefintions
