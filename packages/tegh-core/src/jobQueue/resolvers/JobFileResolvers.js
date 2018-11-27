import { List } from 'immutable'

import getTasksByTaskableID from '../../spool/selectors/getTasksByTaskableID'
import getPrintsCompletedByJobFileID from '../selectors/getPrintsCompletedByJobFileID'
import getTotalPrintsByJobFileID from '../selectors/getTotalPrintsByJobFileID'
import getIsDoneByJobFileID from '../selectors/getIsDoneByJobFileID'

const JobFileResolvers = {
  tasks: (source, args, { store }) => {
    const state = store.getState().spool
    const tasks = getTasksByTaskableID(state).get(source.id, List())

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
    const tasks = getTasksByTaskableID(state.spool).get(source.id, List())

    return total - (printed + tasks.size)
  },
  isDone: (source, args, { store }) => {
    const state = store.getState().jobQueue
    return getIsDoneByJobFileID(state).get(source.id)
  },
}

export default JobFileResolvers
