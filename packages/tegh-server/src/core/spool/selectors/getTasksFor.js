const getTasksFor = state => ({ taskableID }) => {
  return state.allTasks.filter(task => (
    task.jobID === taskableID || task.jobFileID === taskableID
  ))
}

export default getTasksFor
