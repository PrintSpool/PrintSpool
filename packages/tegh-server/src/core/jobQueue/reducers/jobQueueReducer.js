import { Record } from 'immutable'

import Job from '../types/Job'
import Task from '../../spool/types/Task'
import { getTasksCompleted } from '../../spool/reducers/spoolReducer'

import { CREATE_JOB } from '../actions/createJob'
import { DELETE_JOB } from '../actions/deleteJob'

/* reducer */

const initialState = Record({
  jobs: new Map(),
  jobFiles: new Map(),
})()

const jobQueue = () => (state = initialState, action) => {
  switch(action.type) {
    case CREATE_JOB: {
      const { job, jobFiles } = action.payload
      return state
        .setIn(['jobs', job.id], job)
        .mergeIn(['jobFiles'], jobFiles)
    }
    case DELETE_JOB: {
      const { jobID } = action.payload
      return state
        .deleteIn(['jobs', jobID])
        .updateIn(['jobFiles'], jobFiles => (
          jobFiles.filter(file => file.jobID !== jobID)
        ))
    }
    default: {
      return state
    }
  }
}

export default jobQueue
