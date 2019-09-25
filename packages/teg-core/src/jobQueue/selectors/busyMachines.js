import { createSelector } from 'reselect'

import { busyMachineTaskStatuses } from '../types/TaskStatusEnum'

export const BUSY_WITH_JOB = 'BUSY_WITH_JOB'
export const BUSY = 'BUSY'
export const NOT_BUSY = undefined

/*
 * true if there is not a print job spooled or printing
*/
const busyMachines = createSelector(
  config => config.tasks,
  (tasks) => {
    const busy = {}
    tasks.forEach((task) => {
      if (busyMachineTaskStatuses.includes(task.status)) {
        busy[task.machineID] = task.jobID == null ? BUSY : BUSY_WITH_JOB
      }
    })
    return busy
  },
)

export default busyMachines
