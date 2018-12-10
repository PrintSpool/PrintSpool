import { Record } from 'immutable'
import Ajv from 'ajv'

import PluginConfig from '../types/PluginConfig'
import ComponentConfig from '../types/components/ComponentConfig'
import MaterialConfig from '../types/MaterialConfig'
import requestSetConfig from './requestSetConfig'

const PLUGIN = 'PLUGIN'
const COMPONENT = 'COMPONENT'
const MATERIAL = 'MATERIAL'

const ConfigFactories = Record({
  [PLUGIN]: PluginConfig,
  [COMPONENT]: ComponentConfig,
  [MATERIAL]: MaterialConfig,
})()

const collectionKeys = {
  [PLUGIN]: 'plugins',
  [COMPONENT]: 'components',
  [MATERIAL]: 'materials',
}

const requestCreateConfigFromMutation = (source, args, { store }) => {
  const {
    collection,
    schemaFormKey,
    model,
  } = args.input
  const state = store.getState()

  // TODO: host configs
  if (collection !== PLUGIN && collection !== COMPONENT && collection !== MATERIAL) {
    throw new Error(`Unsupported collection ${collection}`)
  }

  const collectionKey = collectionKeys[collection]
  const schemaForm = state.schemaForms.getIn([collectionKey, schemaFormKey])

  if (schemaForm == null) {
    throw new Error(`schemaForm not defined for ${schemaFormKey}`)
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

  const nesting = collection === MATERIAL ? [] : ['printer']

  const recordParams = {
    model,
  }

  if (collection === PLUGIN) {
    recordParams.package = schemaFormKey
  } else {
    recordParams.type = schemaFormKey
  }

  const configRecord = ConfigFactories[collection](recordParams)

  const nextConfig = state.config
    .updateIn([...nesting, collectionKeys[collection]], c => (
      c.push(configRecord)
    ))

  const action = requestSetConfig({
    config: nextConfig,
  })

  return { action }
}

export default requestCreateConfigFromMutation
