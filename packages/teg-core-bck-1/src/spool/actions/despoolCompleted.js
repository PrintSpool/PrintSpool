export const DESPOOL_COMPLETED = 'teg/spool/DESPOOL_COMPLETED'

const despoolCompleted = ({ task }) => ({
  type: DESPOOL_COMPLETED,
  payload: {
    isLastLineInTask: task.currentLineNumber === task.data.size - 1,
    task,
  },
})

export default despoolCompleted
