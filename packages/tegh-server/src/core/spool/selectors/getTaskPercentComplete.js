const getTaskPercentComplete = state => ({ taskID }) => {
  const task = state.allTasks.get(taskID)
  return task.currentLineNumber / task.data.length * 100
}

export default getTaskPercentComplete
