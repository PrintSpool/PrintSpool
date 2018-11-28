const QueryRootResolvers = {
  Query: {
    printers: (_source, args, { store }) => {
      const state = store.getState()
      if (args.id != null && args.id !== state.config.printer.id) {
        throw new Error(`Printer ID ${args.id} does not exist`)
      }
      return [state]
    },
    jobQueue: (_source, args, { store }) => store.getState(),
  },
}

export default QueryRootResolvers
