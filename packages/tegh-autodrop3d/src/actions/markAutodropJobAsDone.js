export const MARK_AUTODROP_JOB_AS_DONE = 'autodrop3d/MARK_AUTODROP_JOB_AS_DONE'

const markAutodropJobAsDone = json => ({
  type: MARK_AUTODROP_JOB_AS_DONE,
  payload: json,
})

export default markAutodropJobAsDone
