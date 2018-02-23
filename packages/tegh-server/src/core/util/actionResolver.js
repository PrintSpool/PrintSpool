const actionResolver = ({
  actionCreator,
  field,
}) => (_source, args, { store }) => {
  const state = store.getState()
  if (args.printerID !== state.config.id) {
    throw new Error(`Printer ID ${args.id} does not exist`)
  }
  const action = actionCreator(args[field])
  store.dispatch(action)
}

export actionResolver
