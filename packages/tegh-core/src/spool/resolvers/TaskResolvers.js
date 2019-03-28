import getTaskPercentComplete from '../selectors/getTaskPercentComplete'

const TaskResolvers = {
  Task: {
    totalLineNumbers: source => source.data.size,
    percentComplete: (source, { digits = 2 }) => (
      getTaskPercentComplete({
        task: source,
        digits,
      })
    ),
    printer: (_source, args, { store }) => {
      const state = store.getState()
      return state
    },
  },
}

export default TaskResolvers
