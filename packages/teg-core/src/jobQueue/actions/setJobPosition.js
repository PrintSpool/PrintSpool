export const SET_JOB_POSITION = 'teg/jobQueue/SET_JOB_POSITION'

const setJobPosition = ({ jobID, position }) => ({
  type: SET_JOB_POSITION,
  payload: { jobID, position },
})

export default setJobPosition
