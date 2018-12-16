import { List } from 'immutable'
import { createSelector } from 'reselect'

import isMacroEnabled from '../../config/selectors/isMacroEnabled'

const getEnabledHostMacros = createSelector(
  ({ plugins, config }) => ({ plugins, config }),
  ({ plugins, config }) => (
    plugins
      .filter(plugin => plugin.macros != null)
      .map((plugin, packageName) => (
        List(plugin.macros).filter(macro => isMacroEnabled({
          config,
          meta: {
            package: packageName,
            macro,
          },
        }))
      ))
      .toList()
      .flatten()
  ),
)

export default getEnabledHostMacros
