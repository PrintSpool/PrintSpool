export const CANCEL_JOB = 'tegh/jobQueue/CANCEL_JOB'

export const cancelJob = ({ jobID }) => ({
  type: CANCEL_JOB,
  jobID,
})
