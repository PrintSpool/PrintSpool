import { execute, buildSchema } from 'graphql'
import configSchema from './configSchema'

const executableConfigSchema = buildSchema(configSchema)

const resolveFromList = ({
  type,
  selector,
  singularLookupKeys = ['id'],
}) => (source, args, { store }) => {
  const state = store.getState()
  const list = selector(state)

  singularLookupKeys.forEach((key) => {
    if (args[key] != null) {
      const entry = list.find(item => item[key] === args[key])
      if (entry === null) {
        throw new Error(`no ${type} with ${key} ${args[key]}`)
      }
      return [entry]
    }

  })

  return list
}

const configResolvers = {
  Query: {
    printerConfigs: resolveFromList({
      name: 'PrinterConfig',
      selector: state => [state.config.printerConfig],
      singularLookupKeys: ['id', 'printerID'],
    }),
    components: resolveFromList({
      name: 'ComponentConfig',
      selector: state => state.config.printerConfig.components,
    }),
    materials: resolveFromList({
      name: 'Material',
      selector: state => state.config.materials,
    }),

  Mutation: {
    patchPrinterConfig: (source, args, { store }) => {
      const state = store.getState().config.printerConfig
      // TODO: validate the next state matches the schema
      const { errors } = execute(
        executableConfigSchema,
        fullConfigQuery,
        nextState,
      )
      if (errors != null) {
        throw new Error(errors.map(error => error.message).join(', '))
      }
    }
  }
}

export const configResolvers
