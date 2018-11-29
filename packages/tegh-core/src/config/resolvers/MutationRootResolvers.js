const PRINTER = 'PRINTER'
const MATERIAL = 'MATERIAL'

const MutationResolver = {
  Mutation: {
    setConfig: (source, args, { store }) => {
      const { routingMode } = args.input
      switch (routingMode) {
        case PRINTER: {
          return null
        }
        case MATERIAL: {
          return null
        }
        // case HOST: {
        //
        // }
        default: {
          throw new Error(`Invalid routingMode ${routingMode}`)
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
