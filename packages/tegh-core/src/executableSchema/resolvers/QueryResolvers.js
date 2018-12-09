const QueryResolvers = {
  Query: {
    /*
     * config
     */
    hostConfigs: (source, args, { store }) => {
      const state = store.getState()

      if (args.hostID && args.hostID !== state.config.host.id) {
        return []
      }

      return [state.config.host]
    },
    printerConfigs: (source, args, { store }) => {
      const state = store.getState()

      if (args.hostID && args.printerID !== state.config.printer.id) {
        return []
      }

      return [state.config.printer]
    },
    materials: (source, args, { store }) => {
      const state = store.getState()

      if (args.materialID != null) {
        const materials = state.config.materials.find(c => (
          c.id === args.materialID
        ))
        if (materials == null) return []
        return [materials]
      }
      return state.config.materials
    },
    schemaForm: (source, args, { store }) => {
      const { collection, printerID, schemaFormKey } = args.input
      const state = store.getState()

      switch (collection) {
        case 'COMPONENT': {
          if (printerID !== state.config.printer.id) {
            throw new Error(`Printer ID: ${printerID} does not exist`)
          }
          const schemaForm = state.schemaForms.getIn(
            ['components', schemaFormKey],
          )
          return schemaForm
        }
        case 'MATERIAL': {
          const schemaForm = state.schemaForms.getIn(
            ['materials', schemaFormKey],
          )
          return schemaForm
        }
        default: {
          throw new Error(`Unsupported collection: ${collection}`)
        }
      }
    },
    /*
     * jobQueue
     */
    jobQueue: (_source, args, { store }) => store.getState(),
    /*
     * printer
     */
    printers: (_source, args, { store }) => {
      const state = store.getState()
      if (args.id != null && args.id !== state.config.printer.id) {
        return []
      }
      return [state]
    },
  },
}

export default QueryResolvers
