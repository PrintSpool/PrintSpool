import Ajv from 'ajv'

import getMutationConfigFormInfo from '../selectors/getMutationConfigFormInfo'
import requestSetConfig from './requestSetConfig'

const requestUpdateConfigFromMutation = (source, args, { store }) => {
  const {
    configFormID,
    modelVersion,
    model,
  } = args.input
  const state = store.getState()

  const {
    subject,
    configPath,
    schemaFormPath,
    isMachine,
  } = getMutationConfigFormInfo({ state, args })

  if (subject === null) {
    throw new Error(
      `id not found: ${configFormID}`,
    )
  }

  // console.log(modelVersion, subject.modelVersion, subject)
  if (modelVersion !== subject.modelVersion) {
    throw new Error(
      'The object was modified by an other user. Please reload the '
      + 'form and try again.',
    )
  }

  const schemaForm = state.schemaForms.getIn(schemaFormPath)
  if (schemaForm == null) {
    throw new Error(`schemaForm not defined for ${schemaFormPath}`)
  }

  // Validate the input against the JSON Schema
  const ajv = new Ajv({
    allErrors: true,
    jsonPointers: true,
  })
  const validate = ajv.compile(schemaForm.schema)
  const valid = validate(model)

  if (!valid) {
    return {
      errors: validate.errors,
    }
  }

  let nextConfig = state.config
    .setIn([...configPath, 'modelVersion'], subject.modelVersion + 1)

  if (isMachine) {
    nextConfig = nextConfig.setIn(['printer', 'isConfigured'], true)

    /*
     * The machine schema form provides shortcuts to the most common settings
     * but those settings are not stored together. Instead they are logically
     * grouped with their components and plugins in the printer config.
     *
     * copy the machine form values to their respective locations in the
     * printer's configuration.
     */
    schemaForm.configPaths.mapEntries(([k, getFieldConfigPath]) => {
      const fieldPath = getFieldConfigPath(state.config.printer)
      const keyPath = ['printer', ...fieldPath, 'model', k]

      if (state.config.hasIn(keyPath) === false) {
        throw new Error(`Path does not exist: ${keyPath.join('.')}`)
      }

      nextConfig = nextConfig.setIn(keyPath, model[k])
    })
  } else {
    nextConfig = nextConfig.updateIn(
      [...configPath, 'model'],
      previousVal => previousVal.merge(model),
    )
  }

  const action = requestSetConfig({
    config: nextConfig,
  })

  return { action }
}

export default requestUpdateConfigFromMutation
