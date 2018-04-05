import getJobStatus from '../selectors/getJobStatus'
import { PRINTING } from '../types/JobStatusEnum'

export const DELETE_JOB = 'tegh/jobQueue/DELETE_JOB'

const deleteJob = ({ jobID }) => {
  return async (dispatch, getState) => {
    const jobStatus = getJobStatus(getState())({ jobID })

    if (jobStatus === PRINTING) {
      throw new Error('Cannot delete a job while it is printing')
    }

    const action = {
      type: DELETE_JOB,
      payload: { jobID },
    }
    return dispatch(action)
  }
}

export default deleteJob
