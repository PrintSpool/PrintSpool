export const JOB_DOWNLOAD_FAIL = 'autodrop3d/JOB_DOWNLOAD_FAIL'

const jobDownloadFail = e => ({
  type: JOB_DOWNLOAD_FAIL,
  payload: {
    error: e,
  },
})

export default jobDownloadFail
