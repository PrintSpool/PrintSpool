export const REQUEST_SPOOL_JOB_FILE = 'teg-core/jobQueue/REQUEST_SPOOL_JOB_FILE'

const requestSpoolJobFile = ({ jobFileID, machineID }) => ({
  type: REQUEST_SPOOL_JOB_FILE,
  payload: {
    jobFileID,
    machineID,
  },
})

export default requestSpoolJobFile
