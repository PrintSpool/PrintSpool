export const DELETE_JOB = 'tegh/jobQueue/DELETE_JOB'

const deleteJob = ({ jobID }) => ({
  type: DELETE_JOB,
  payload: { jobID },
})

export default deleteJob
