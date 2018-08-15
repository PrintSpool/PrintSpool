export const DESPOOL_TASK = 'tegh-server/spool/DESPOOL_TASK'

const despoolTask = task => ({
  type: DESPOOL_TASK,
  payload: { task },
})

export default despoolTask
