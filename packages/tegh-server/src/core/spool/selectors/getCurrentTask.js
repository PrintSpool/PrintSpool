import getTask from './getTask'

const getCurrentTask = state => getTask(state)(state.spool.currentTaskID)

export default getCurrentTask
