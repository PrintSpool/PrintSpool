import { createSelector } from 'reselect'

import { EMERGENCY } from '../types/PriorityEnum'
import getCurrentTask from './getCurrentTask'

const isEmergency = createSelector(
  getCurrentTask,
  task => task != null && task.priority === EMERGENCY,
)

export default isEmergency
