import { createSelector } from 'reselect'

import {
  BUBBLING_STATUES,
  DONE,
  QUEUED,
} from '../types/JobStatusEnum'

import getTasksFor from '../../spool/selectors/getTasksFor'
import getTasksCompleted from '../../spool/selectors/getTasksCompleted'
import getJobFileTotalTasks from './getJobFileTotalTasks'


const getJobFileStatus = createSelector(
  state => ({ jobFileID }) => {
    const tasks = getTasksFor(state)({ taskableID: jobFileID })
    const tasksCompleted = getTasksCompleted(state)({ taskableID: jobFileID })
    const totalTasks = getJobFileTotalTasks(state)({ jobFileID })

    const bubblingTask = tasks.find(task => BUBBLING_STATUES.includes(task.status))

    if (bubblingTask != null) return bubblingTask.status

    const isDone = tasksCompleted >= totalTasks
    return isDone ? DONE : QUEUED
  },
)

export default getJobFileStatus
