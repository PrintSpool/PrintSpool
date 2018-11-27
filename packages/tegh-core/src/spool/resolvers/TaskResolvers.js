import getTaskPercentComplete from '../selectors/getTaskPercentComplete'

const TaskResolvers = {
  totalLineNumbers: source => source.data.size,
  percentComplete: (source, { digits }, { store }) => {
    const state = store.getState().spool
    return getTaskPercentComplete(state)({
      taskID: source.id,
      digits,
    })
  },
  printer: (_source, args, { store }) => {
    const state = store.getState()
    return state
  },
}

export default TaskResolvers
