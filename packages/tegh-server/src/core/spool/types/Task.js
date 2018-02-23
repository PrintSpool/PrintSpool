import type { RecordOf, List, Set } from 'immutable'
import type { PriorityEnumT } from './PriorityEnum'
import type { TaskStatusEnumT } from './TaskStatusEnum'

import uuid from 'uuid/v4'
import { Record, List } from 'immutable'

import normalizeGCodeLines from '../../util/normalizegCodeLines'
import { PriorityOrder } from './PriorityEnum'

export type TaskT = RecordOf<{
  id: string,
  priority: PriorityEnumT,
  internal: boolean,
  data: List<string>,
  jobFileID: ?string,
  name: ?string,
  currentLineNumber: ?number,
  createdAt: ?number,
  startedAt: ?number,
  stoppedAt: ?number,
  status: TaskStatusEnumT,
}>

const TaskRecord = Record({
  id: null,
  priority: null,
  internal: null,
  name: null,
  jobFileID: null,
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
  name,
  jobFileID,
  data,
}) => {
  if (typeof name !== 'string') {
    throw new Error(`name must be a string`)
  }
  if (typeof internal !== 'boolean') {
    throw new Error(`data must be a boolean`)
  }
  if (!PriorityOrder.includes(priority)) {
    throw new Error(`invalid priority`)
  }
  TaskRecord({
    id: uuid(),
    createdAt: new Date().toISOString(),
    data: List(normalizeGCodeLines(data)),
    status: 'queued',
    priority,
    internal,
    name,
    jobFileID,
  })
}

export default Task
