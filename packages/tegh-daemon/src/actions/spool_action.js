import uuid from 'uuid/v4'
import { Record, List } from 'immutable'

import normalizeGCodeLines from '../helpers/normalize_gcode_lines'

const Task = Record({
  id: null,
  spoolName: null,
  fileName: null,
  data: null,
  status: null,
  currentLineNumber: null,
  createdAt: null,
  startedAt: null,
  stoppedAt: null,
})

const spool = ({ spoolName, fileName, data }) => {
  const task = new Task({
    id: uuid(),
    spoolName,
    fileName,
    data: List(normalizeGCodeLines(data)),
    status: 'queued',
    createdAt: new Date().toISOString(),
  })

  return {
    type: 'SPOOL',
    spoolID: 'printQueue',
    task,
  }
}

export default spool
