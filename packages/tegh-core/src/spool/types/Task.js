import type { RecordOf, List as ListT } from 'immutable'
import uuid from 'uuid'
import { Record, List } from 'immutable'
import type { PriorityEnumT } from './PriorityEnum'
import type { TaskStatusEnumT } from './TaskStatusEnum'


import normalizeGCodeLines from '../../util/normalizeGCodeLines'
import { priorityOrder, NORMAL } from './PriorityEnum'
import { SPOOLED } from './TaskStatusEnum'

export type TaskT = RecordOf<{
  id: string,
  jobID: ?string,
  jobFileID: ?string,

  priority: PriorityEnumT,
  internal: boolean,
  data: ListT<string>,
  name: ?string,

  /*
   * The line number that will be executed by the printer by a saga after the
   * reducers run.
   */
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
  jobID: null,
  jobFileID: null,
  data: null,
  status: null,
  currentLineNumber: null,
  createdAt: null,
  startedAt: null,
  stoppedAt: null,
})

const Task = (attrs) => {
  const {
    priority,
    internal,
    name,
    data,
  } = attrs

  if (typeof name !== 'string') {
    throw new Error('name must be a string')
  }
  if (typeof internal !== 'boolean') {
    throw new Error('internal must be a boolean')
  }
  if (!priorityOrder.includes(priority)) {
    throw new Error('invalid priority')
  }
  if (!Array.isArray(data)) {
    throw new Error('data must be an array of strings')
  }
  return TaskRecord({
    id: uuid.v4(),
    createdAt: new Date().toISOString(),
    status: SPOOLED,
    ...attrs,
    data: List(normalizeGCodeLines(data)),
  })
}

export const MockTask = attrs => Task({
  name: 'test.ngc',
  internal: true,
  priority: NORMAL,
  data: ['g1 x10', 'g1 y20'],
  ...attrs,
})

export default Task
