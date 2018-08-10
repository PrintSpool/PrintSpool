const actionResolver = ({
  actionCreator,
  selector,
}) => async (_source, args, { store }) => {
  try {
    const state = store.getState()
    const { printerID } = args.input
    if (printerID !== state.config.id) {
      throw new Error(`Printer ID ${printerID} does not exist`)
    }

    const thunk = actionCreator(args.input)
    const action = await store.dispatch(thunk)

    return selector(store.getState(), action)
  } catch (e) {
    console.error(`Mutation Error: ${e.message}`)
    console.error(e.stack)
    throw e
  }
}

export default actionResolver
