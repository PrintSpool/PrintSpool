import { List } from 'immutable'

import getJobFilesByJobID from '../selectors/getJobFilesByJobID'
import getTasksByTaskableID from '../selectors/getTasksByTaskableID'
import getPrintsCompletedByJobID from '../selectors/getPrintsCompletedByJobID'
import getTotalPrintsByJobID from '../selectors/getTotalPrintsByJobID'
import getIsDoneByJobID from '../selectors/getIsDoneByJobID'
import getHistoryByJobID from '../selectors/getHistoryByJobID'

const JobResolvers = {
  Job: {
    files: (source, args, { store }) => {
      const state = store.getState().jobQueue
      const jobID = source.id
      return getJobFilesByJobID(state).get(jobID, List())
    },
    tasks: (source, args, { store }) => {
      const state = store.getState()
      return getTasksByTaskableID(state.jobQueue).get(source.id, List())
    },
    history: (source, args, { store }) => {
      const state = store.getState().jobQueue
      return getHistoryByJobID(state).get(source.id, List())
    },
    printsCompleted: (source, args, { store }) => {
      const state = store.getState().jobQueue
      return getPrintsCompletedByJobID(state).get(source.id, 0)
    },
    totalPrints: (source, args, { store }) => {
      const state = store.getState().jobQueue
      return getTotalPrintsByJobID(state).get(source.id)
    },
    isDone: (source, args, { store }) => {
      const state = store.getState().jobQueue
      return getIsDoneByJobID(state).get(source.id, false)
    },
  },
}

export default JobResolvers
