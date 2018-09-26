import { Record, Map } from 'immutable'
import { loop, Cmd } from 'redux-loop'

import unlinkTmpFiles from '../sideEffects/unlinkTmpFiles'

import { ERRORED, CANCELLED, DONE } from '../types/JobStatusEnum'

import getJobsByStatus from '../selectors/getJobsByStatus'
import getJobTmpFiles from '../selectors/getJobTmpFiles'

import { SPOOL_TASK } from '../../spool/actions/spoolTask'
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
    case SPOOL_TASK: {
      /* delete the previous job upon spooling the next */
      if (action.payload.task.jobID == null) return

      /* get all completed, errored or cancelled jobs */
      const jobsForDeletion = getJobsByStatus(state)({
        statuses: [ERRORED, CANCELLED, DONE],
      })
      const jobIDsForDeletion = jobsForDeletion.map(job => job.id)

      const nextState = state
        .filterIn(['jobs'], job => jobIDsForDeletion.include(job.id) === false)

      const tmpFilePaths = jobsForDeletion
        .map(job => (
          getJobTmpFiles(state)({ jobID: job.id })
        ))
        .flatten()

      return loop(
        nextState,
        Cmd.run(unlinkTmpFiles, tmpFilePaths),
      )
    }
    default: {
      return state
    }
  }
}

export default jobQueue
