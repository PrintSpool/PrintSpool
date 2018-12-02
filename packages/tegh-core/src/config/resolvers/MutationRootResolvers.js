import Ajv from 'ajv'
// import jsonSchemaDraft06 from 'ajv/lib/refs/json-schema-draft-06.json'

import getComponents from '../selectors/getComponents'
import requestSetConfig from '../actions/requestSetConfig'

// ajv.addMetaSchema(jsonSchemaDraft06)

const PRINTER = 'PRINTER'
const MATERIAL = 'MATERIAL'

const getConfigFormInfo = ({ state, args }) => {
  const {
    routingMode,
    printerID,
    hostID,
    configFormID,
  } = args.input

  switch (routingMode) {
    case PRINTER: {
      const components = getComponents(state.config)
      const { plugins } = state.config.printer

      if (printerID !== state.config.printer.id) {
        throw new Error(`Printer ID: ${printerID} does not exist`)
      }

      const isComponent = components.get(configFormID) != null

      const subject = (
        components.get(configFormID)
        || plugins.find(p => p.id === configFormID)
      )

      const collectionKey = isComponent ? 'components' : 'plugins'
      const collectionPath = ['printer', collectionKey]

      return {
        subject,
        collectionPath,
        schemaKey: subject.type || subject.package,
      }
    }
    case MATERIAL: {
      const subject = state.config.materials.find(m => m.id === configFormID)
      return {
        subject,
        collectionPath: ['materials'],
        schemaKey: subject.type,
      }
    }
    // case HOST: {
    //
    // }
    default: {
      throw new Error(`Unsupported routingMode: ${routingMode}`)
    }
  }
}

const MutationResolver = {
  Mutation: {
    setConfig: (source, args, { store }) => {
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
      } = getConfigFormInfo({ state, args })

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

      console.log([...collectionPath, index])

      const action = requestSetConfig({
        config: state.config.updateIn(
          [...collectionPath, index, 'model'],
          previousVal => previousVal.merge(model),
        ),
      })
      store.dispatch(action)

      return {}
    },
  },
}

export default MutationResolver
