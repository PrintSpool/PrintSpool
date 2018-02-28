/* selectors */
export const isIdle = state => (
  state.allTasks.every(task => task.jobID == null || task.status !== 'printing')
)

export const getTaskPercentComplete = state => ({ taskID }) => {
  const task = state.allTasks.get(taskID)
  return task.currentLineNumber / task.data.length * 100
}

export const getTasksFor = state => ({ taskableID }) => {
  return state.allTasks.filter(task => (
    task.jobID === taskableID || task.jobFileID === taskableID
  ))
}

export const getTasksCompleted = state => ({ taskableID }) => {
  const tasks = getTasksFor(state)({ taskableID })
  return tasks.filter(task => task.status === 'done').size
}
