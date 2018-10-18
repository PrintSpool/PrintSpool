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

    const action = actionCreator(args.input)
    store.dispatch(action)
    // TODO: await the chain of side effects' completion for the action
    // let action = store.dispatch(thunk)
    // if (action.then != null) {
    //   action = await action
    // }

    return selector(store.getState(), action)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Mutation Error: ${e.message}`)
    // eslint-disable-next-line no-console
    console.error(e.stack)
    throw e
  }
}

export default actionResolver
