export const JOB_DOWNLOAD_COMPLETE = 'autodrop3d/JOB_DOWNLOAD_COMPLETE'

const jobDownloadComplete = responseText => ({
  type: JOB_DOWNLOAD_COMPLETE,
  payload: responseText,
})

export default jobDownloadComplete
