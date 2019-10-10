import { List } from 'immutable'

import { CANCELLED, ERROR } from '../types/TaskStatusEnum'

import getTasksByTaskableID from '../selectors/getTasksByTaskableID'
import getPrintsCompletedByJobFileID from '../selectors/getPrintsCompletedByJobFileID'
import getTotalPrintsByJobFileID from '../selectors/getTotalPrintsByJobFileID'
import getIsDoneByJobFileID from '../selectors/getIsDoneByJobFileID'

const JobFileResolvers = {
  JobFile: {
    tasks: (source, args, { store }) => {
      const state = store.getState()
      const tasks = getTasksByTaskableID(state.jobQueue).get(source.id, List())

      return tasks
    },
    printsCompleted: (source, args, { store }) => {
      const state = store.getState().jobQueue
      return getPrintsCompletedByJobFileID(state).get(source.id, 0)
    },
    totalPrints: (source, args, { store }) => {
      const state = store.getState().jobQueue
      return getTotalPrintsByJobFileID(state).get(source.id)
    },
    printsQueued: (source, args, { store }) => {
      const state = store.getState()

      const total = getTotalPrintsByJobFileID(state.jobQueue).get(source.id)
      const printed = getIsDoneByJobFileID(state.jobQueue).get(source.id)

      const tasks = getTasksByTaskableID(state.jobQueue)
        .get(source.id, List())
        .filter(task => task.status !== CANCELLED && task.status !== ERROR)

      return total - (printed + tasks.size)
    },
    isDone: (source, args, { store }) => {
      const state = store.getState().jobQueue
      return getIsDoneByJobFileID(state).get(source.id)
    },
  },
}

export default JobFileResolvers
