import getTasksFor from './getTasksFor'

const getTasksCompleted = state => ({ taskableID }) => {
  const tasks = getTasksFor(state)({ taskableID })
  return tasks.filter(task => task.status === 'done').size
}

export default getTasksCompleted
