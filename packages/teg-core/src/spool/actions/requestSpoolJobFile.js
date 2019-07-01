export const REQUEST_SPOOL_JOB_FILE = 'teg-core/spool/REQUEST_SPOOL_JOB_FILE'

const requestSpoolJobFile = ({ jobFileID }) => ({
  type: REQUEST_SPOOL_JOB_FILE,
  payload: {
    jobFileID,
  },
})

export default requestSpoolJobFile
