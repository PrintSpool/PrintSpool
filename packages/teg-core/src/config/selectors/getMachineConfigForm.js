
import { createSelector } from 'reselect'

const getMachineConfigForm = createSelector(
  state => state,
  (state) => {
    const schemaForm = state.schemaForms.get('machine')

    // const { configPaths } =
    // const schemaForm = state.schemaForms.get('machine')

    /*
     * The machine schema form provides shortcuts to the most common settings
     * but those settings are not stored together. Instead they are logically
     * grouped with their components and plugins in the printer config.
     */
    const model = schemaForm.configPaths.mapEntries(([k, getConfigPath]) => {
      const configPath = getConfigPath(state.config.printer)

      const keyPath = ['printer', ...configPath, 'model', k]

      if (state.config.hasIn(keyPath) === false) {
        throw new Error(`Path does not exist: ${keyPath.join('.')}`)
      }

      return [k, state.config.getIn(keyPath)]
    })

    return {
      model: model.toJS(),
      modelVersion: state.config.printer.modelVersion,
      schemaForm,
    }
  },
)

export default getMachineConfigForm
