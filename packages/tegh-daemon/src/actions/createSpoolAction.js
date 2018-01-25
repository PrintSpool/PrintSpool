import uuid from 'uuid/v4'
import { Record, List } from 'immutable'

import normalizeGCodeLines from '../helpers/normalize_gcode_lines'

const Task = Record({
  id: null,
  priority: null,
  internal: null,
  fileName: null,
  data: null,
  status: null,
  currentLineNumber: null,
  createdAt: null,
  startedAt: null,
  stoppedAt: null,
})

const createSpoolAction = ({
  priority,
  internal,
  fileName,
  data,
}) => {
  const task = new Task({
    id: uuid(),
    priority,
    internal,
    fileName,
    data: List(normalizeGCodeLines(data)),
    status: 'queued',
    createdAt: new Date().toISOString(),
  })

  return {
    type: 'SPOOL',
    task,
  }
}

export default createSpoolAction
