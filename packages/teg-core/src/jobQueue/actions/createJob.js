export const CREATE_JOB = 'teg/jobQueue/CREATE_JOB'

const createJob = ({ onCreate, job, jobFiles }) => ({
  type: CREATE_JOB,
  payload: {
    onCreate,
    job,
    jobFiles,
  },
})

export default createJob
