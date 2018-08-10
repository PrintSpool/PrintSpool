import { createSelector } from 'reselect'
import _ from 'lodash'

import getTasks from './getTasks'

const getTasksFor = createSelector(
  [getTasks],
  tasks => _.memoize(({ taskableID }) => tasks.filter(task => (
    task.jobID === taskableID || task.jobFileID === taskableID
  ))),
)

export default getTasksFor
