export const DELETE_JOB = 'tegh/jobQueue/DELETE_JOB'

export const deleteJob = ({ jobID }) => ({
  type: DELETE_JOB,
  payload: { jobID },
})
