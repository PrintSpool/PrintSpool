import type { RecordOf, List, Set } from 'immutable'
import type { Priority } from './priority'
import normalizeGCodeLines from '../helpers/normalize_gcode_lines'

export type TaskT = RecordOf<{
  id: string,
  priority: Priority,
  internal: boolean,
  data: List<string>,
  jobID: ?string,
  fileName: ?string,
  currentLineNumber: ?number,
  createdAt: ?number,
  startedAt: ?number,
  stoppedAt: ?number,
  status: 'initialized' | 'queued' | 'printing' | 'errored' | 'cancelled' | 'done',
}>

import uuid from 'uuid/v4'
import { Record, List } from 'immutable'

import normalizeGCodeLines from '../helpers/normalize_gcode_lines'

const TaskRecord = Record({
  id: null,
  priority: null,
  internal: null,
  fileName: null,
  jobID: null,
  data: null,
  status: null,
  currentLineNumber: null,
  createdAt: null,
  startedAt: null,
  stoppedAt: null,
})

const Task = ({
  priority,
  internal,
  fileName,
  data,
}) => TaskRecord({
  id: uuid(),
  createdAt: new Date().toISOString(),
  data: List(normalizeGCodeLines(data)),
  status: 'queued',
  priority,
  internal,
  fileName,
})

export default Task
