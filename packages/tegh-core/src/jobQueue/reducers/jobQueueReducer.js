import { Record, Map } from 'immutable'

import { CREATE_JOB } from '../actions/createJob'
import { DELETE_JOB } from '../actions/deleteJob'

/* reducer */

export const initialState = Record({
  jobs: Map(),
  jobFiles: Map(),
})()

const jobQueue = (state = initialState, action) => {
  switch (action.type) {
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
