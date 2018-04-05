import {
  DONE,
} from '../types/TaskStatusEnum'

const getTaskPercentComplete = ({ task, digits }) => {
  if (digits < 0) {
    throw new Error('digits cannot be negative')
  }
  const factor = Math.pow(10, digits)
  let value
  if (task.status === DONE) {
    value = 100
  }
  else {
    value = task.currentLineNumber / task.data.size * 100
  }
  return Math.round(value * factor) / factor
}

export default getTaskPercentComplete
