import getTaskPercentComplete from '../selectors/getTaskPercentComplete'

const TaskResolvers = {
  Task: {
    totalLineNumbers: source => source.data.size,
    percentComplete: (source, { digits = 0 }, { store }) => {
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
  },
}

export default TaskResolvers
