export const START_TASK = 'tegh-core/spool/START_TASK'

/*
 * Accepted by the taskReducer but not exposed by the spoolReducer. Calling
 * startTask outside of the taskReducer is a no-op
 */
const startTask = () => ({
  type: START_TASK,
})

export default startTask
