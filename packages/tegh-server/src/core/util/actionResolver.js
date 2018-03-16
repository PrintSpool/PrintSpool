const actionResolver = ({
  actionCreator,
  selector,
}) => async (_source, args, { store }) => {
  const state = store.getState()
  if (args.printerID !== state.config.id) {
    throw new Error(`Printer ID ${args.printerID} does not exist`)
  }

  const thunk = actionCreator(args)
  const action = await store.dispatch(thunk)

  return selector(store.getState(), action)
}

export default actionResolver
