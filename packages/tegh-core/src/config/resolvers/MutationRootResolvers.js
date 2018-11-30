import Ajv from 'ajv'
// import jsonSchemaDraft06 from 'ajv/lib/refs/json-schema-draft-06.json'

import getComponents from '../selectors/getComponents'
import requestSetConfig from '../actions/requestSetConfig'

// ajv.addMetaSchema(jsonSchemaDraft06)

const PRINTER = 'PRINTER'
const MATERIAL = 'MATERIAL'

const MutationResolver = {
  Mutation: {
    setConfig: (source, args, { store }) => {
      const {
        routingMode,
        printerID,
        hostID,
        configFormID,
        modelVersion,
        model,
      } = args.input
      switch (routingMode) {
        case PRINTER: {
          const state = store.getState()
          const components = getComponents(state.config)
          const { plugins } = state.config.printer

          if (printerID !== state.config.printer.id) {
            throw new Error(`Printer ID: ${printerID} does not exist`)
          }

          const isComponent = components.get(configFormID) != null

          const componentOrPlugin = (
            components.get(configFormID)
            || plugins.find(p => p.id === configFormID)
          )
          if (componentOrPlugin === null) {
            throw new Error(
              `id not found: ${configFormID}`,
            )
          }

          if (modelVersion !== componentOrPlugin.modelVersion) {
            throw new Error(
              'The object was modified by an other user. Please reload the '
              + 'form and try again.',
            )
          }

          const type = componentOrPlugin.type || componentOrPlugin.package

          const schema = state.schemaForms.get(type)
          if (schema == null) {
            throw new Error(`schema not defined for type ${type}`)
          }

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

          const collectionPath = isComponent ? 'components' : 'plugins'
          const index = state.config.printer.get(collectionPath)
            .findIndex(c => c.id === configFormID)

          const action = requestSetConfig({
            config: state.config.updateIn(
              ['printer', collectionPath, index],
              previousVal => previousVal.merge(model),
            ),
          })
          store.dispatch(action)

          return {}
        }
        // case MATERIAL: {
        //   return null
        // }
        // case HOST: {
        //
        // }
        default: {
          throw new Error(`Unsupported routingMode: ${routingMode}`)
        }
      }
    },
    // patchPrinterConfig: (source, args, { store }) => {
    //   const state = store.getState().config.printerConfig
    //   // TODO: validate the next state matches the schema
    //   const { errors } = execute(
    //     executableConfigSchema,
    //     fullConfigQuery,
    //     nextState,
    //   )
    //   if (errors != null) {
    //     throw new Error(errors.map(error => error.message).join(', '))
    //   }
    // },
  },
}

export default MutationResolver
