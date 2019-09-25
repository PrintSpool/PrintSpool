import { Record, List } from 'immutable'

import { SPOOLED_TASK } from './TaskStatusEnum'

// export type TaskT = RecordOf<{
//   id: string,
//   jobID: ?string,
//   jobFileID: ?string,

//   priority: PriorityEnumT,
//   internal: boolean,
//   isPollingRequest: boolean,
//   data: ListT<string>,
//   name: ?string,

//   /*
//    * The line number that will be executed by the printer by a saga after the
//    * reducers run.
//    */
//   currentLineNumber: ?number,

//   createdAt: ?number,
//   startedAt: ?number,
//   stoppedAt: ?number,
//   status: TaskStatusEnumT,
// }>

const TaskRecord = Record({
  id: null,
  machineID: null,
  jobID: null,
  jobFileID: null,
  name: null,
  filePath: null,
  commands: null,
  annotations: List(),
  totalLines: null,
  machineOverride: false,
  previousLineNumber: null,
  currentLineNumber: null,
  status: SPOOLED_TASK,
  onComplete: () => {},
  onError: () => {},
})

let nextTaskID = 1

const Task = (attrs) => {
  const {
    name,
    commands,
  } = attrs

  if (typeof name !== 'string') {
    throw new Error('name must be a string')
  }
  if (commands != null) {
    if (!Array.isArray(commands)) {
      throw new Error('commands must be an array of strings')
    }
  } else if (typeof attrs.filePath !== 'string') {
    throw new Error('One of task.commands or task.filePath must be set')
  }

  const id = attrs.id || nextTaskID
  nextTaskID += 1

  return TaskRecord({
    id,
    createdAt: new Date().toISOString(),
    ...attrs,
    commands,
  })
}

export const MockTask = attrs => Task({
  name: 'test.ngc',
  internal: true,
  data: ['g1 x10', 'g1 y20'],
  ...attrs,
})

export default Task
