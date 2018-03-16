const actionResolver = ({
  actionCreator,
  selector,
}) => (_source, args, { store }) => {
  const state = store.getState()
  if (args.printerID !== state.config.id) {
    throw new Error(`Printer ID ${args.printerID} does not exist`)
  }

  const action = actionCreator(args)
  store.dispatch(action)

  return selector(store.getState(), action)
}

export default actionResolver
