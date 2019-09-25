import getTaskPercentComplete from '../selectors/getTaskPercentComplete'

const TaskResolvers = {
  Task: {
    totalLineNumbers: source => source.totalLines,
    percentComplete: (source, { digits = 2 }) => (
      getTaskPercentComplete({
        task: source,
        digits,
      })
    ),
    machine: (source, args, { store }) => {
      const state = store.getState()
      return state.sockets.machines.get(source.machineID)
    },
  },
}

export default TaskResolvers
