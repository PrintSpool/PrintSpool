export const TASK_ERRORED = 'teg-core/spool/TASK_ERRORED'

const taskErrored = ({ task }) => ({
  type: TASK_ERRORED,
  payload: { task },
})

export default taskErrored