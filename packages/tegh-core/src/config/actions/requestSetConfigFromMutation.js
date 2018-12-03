import Ajv from 'ajv'

import getMutationConfigFormInfo from '../selectors/getMutationConfigFormInfo'
import requestSetConfig from './requestSetConfig'

const requestSetConfigFromMutation = (source, args, { store }) => {
  const {
    configFormID,
    modelVersion,
    model,
  } = args.input
  const state = store.getState()
  const {
    subject,
    schemaKey,
    collectionPath,
  } = getMutationConfigFormInfo({ state, args })

  if (subject === null) {
    throw new Error(
      `id not found: ${configFormID}`,
    )
  }

  if (modelVersion !== subject.modelVersion) {
    throw new Error(
      'The object was modified by an other user. Please reload the '
      + 'form and try again.',
    )
  }

  const schema = state.schemaForms.get(schemaKey)
  if (schema == null) {
    throw new Error(`schema not defined for ${schemaKey}`)
  }

  // Validate the input against the JSON Schema
  const ajv = new Ajv({
    allErrors: true,
    jsonPointers: true,
  })
  const validate = ajv.compile(schema)
  const valid = validate(model)

  if (!valid) {
    return {
      errors: validate.errors,
    }
  }

  const index = state.config.getIn(collectionPath).findIndex(c => (
    c.id === configFormID
  ))

  const nextConfig = state.config
    .setIn([...collectionPath, index, 'modelVersion'], subject.modelVersion + 1)
    .updateIn(
      [...collectionPath, index, 'model'],
      previousVal => previousVal.merge(model),
    )

  const action = requestSetConfig({
    config: nextConfig,
  })

  return { action }
}

export default requestSetConfigFromMutation
