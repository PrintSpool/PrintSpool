import { createSelector } from 'reselect'
import getTasks from './getTasks'

/*
 * true if there is not a print job spooled or printing
*/
const isIdle = createSelector(
  [ getTasks ],
  tasks => {
    tasks.every(task =>
      task.jobID == null &&
      ['SPOOLED', 'PRINTING'].includes(task.status) === false
    )
  },
)

export default isIdle
