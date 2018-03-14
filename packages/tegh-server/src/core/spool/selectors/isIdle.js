/*
 * true if there is not a print job spooled or printing
*/
const isIdle = state => (
  state.tasks.every(task =>
    task.jobID == null &&
    ['SPOOLED', 'PRINTING'].includes(task.status) === false
  )
)

export default isIdle
