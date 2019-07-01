import { createSelector } from 'reselect'
import getSchemaForms from './getSchemaForms'

const getAvailablePackageSchemaForms = createSelector(
  state => state,
  (state) => {
    const { availablePlugins } = state.pluginManager
    const schemaForms = getSchemaForms.resultFunc(
      Object.values(availablePlugins),
    )

    return schemaForms
  },
)

export default getAvailablePackageSchemaForms
