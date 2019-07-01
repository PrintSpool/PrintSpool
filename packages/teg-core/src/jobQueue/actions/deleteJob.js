export const DELETE_JOB = 'teg/jobQueue/DELETE_JOB'

const deleteJob = ({ jobID }) => ({
  type: DELETE_JOB,
  payload: { jobID },
})

export default deleteJob
