// import { execute, buildSchema } from 'graphql'
// import configSchema from './configSchema'

// const executableConfigSchema = buildSchema(configSchema)

const resolveFromList = ({
  type,
  selector,
  singularLookupKeys = ['id'],
  requirePrinterIDMatch = false,
}) => (source, args, { store }) => {
  const state = store.getState()
  let list = selector(state)

  if (requirePrinterIDMatch && args.printerID !== state.config.printerID) {
    throw new Error(`Printer ID: ${args.printerID} not found`)
  }

  singularLookupKeys.forEach((key) => {
    if (args[key] != null) {
      const entry = list.find(item => item[key] === args[key])
      if (entry === null) {
        throw new Error(`no ${type} with ${key} ${args[key]}`)
      }
      list = [entry]
    }
  })

  return list.map(model => ({
    schemaForm: {
      // TODO: use selectors to load each model's form and schema
      form: ['name'],
      schema: {
        type: 'object',
        required: [
        ],
        title: '3D Printer',
        properties: {
          name: {
            title: 'Name',
            type: 'string',
          },
        },
      },
    },
    model,
  }))
}

const QueryRootResolvers = {
  hostConfigs: resolveFromList({
    type: 'HostConfig',
    selector: state => [state.config.hostConfig],
    singularLookupKeys: ['hostID'],
  }),
  printerConfigs: resolveFromList({
    type: 'PrinterConfig',
    selector: state => [state.config.printerConfig],
    singularLookupKeys: ['printerID'],
  }),
  components: resolveFromList({
    type: 'ComponentConfig',
    selector: state => state.config.printerConfig.components,
    requirePrinterIDMatch: true,
  }),
  materials: resolveFromList({
    name: 'Material',
    selector: state => state.config.materials,
  }),
}

export default QueryRootResolvers
