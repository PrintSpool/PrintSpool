import { createSelector } from 'reselect'

import { EMERGENCY } from '../types/PriorityEnum'
import getCurrentTask from './getCurrentTask'

const isEmergency = createSelector(
  getCurrentTask,
  (task) => {
    if (task == null) return false
    return task.priority === EMERGENCY
  },
)

export default isEmergency
