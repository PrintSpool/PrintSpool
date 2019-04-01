export const AUTODROP_JOB_DONE_FAIL = 'autodrop3d/AUTODROP_JOB_DONE_FAIL'

const autodropJobDoneFail = e => ({
  type: AUTODROP_JOB_DONE_FAIL,
  payload: {
    error: e,
  },
})

export default autodropJobDoneFail
