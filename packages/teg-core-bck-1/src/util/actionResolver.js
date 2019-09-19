const actionResolver = ({
  requireMachineID = true,
  actionCreator,
  selector,
}) => async (_source, args, { store }) => {
  try {
    const state = store.getState()
    const { machineID } = args.input
    if (requireMachineID && machineID !== state.config.printer.id) {
      throw new Error(`Machine ID ${machineID} does not exist`)
    }

    const action = actionCreator(args.input)
    const isThunk = action.type == null
    if (isThunk) {
      // TODO: thunks are no longer returning their action because of an
      // unknown conflict presumably with redux-loop.
      // Suggested solution: Move all thunk async logic to redux loops and
      // uninstall redux-thunk. Pros: increases testability. Cons: takes work.
      await store.dispatch(action)
    } else {
      store.dispatch(action)
      // TODO: await the chain of side effects' completion for the action
    }

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
