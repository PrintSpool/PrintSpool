import uuid from 'uuid'
import { Record } from 'immutable'

import TaskHistoryEnum from './TaskStatusEnum'

const JobHistoryEventRecord = Record({
  id: null,
  jobID: null,
  jobFileID: null,
  taskID: null,
  machineID: null,
  createdAt: null,
  type: null,
})

const JobHistoryEvent = (attrs) => {
  const { type } = attrs

  if (TaskHistoryEnum[type] == null) {
    throw new Error(`Invalid Job History type: ${attrs.type}`)
  }

  return JobHistoryEventRecord({
    id: uuid.v4(),
    createdAt: new Date().toISOString(),
    ...attrs,
  })
}

export default JobHistoryEvent
