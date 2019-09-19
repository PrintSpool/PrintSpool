import uuid from 'uuid'
import { Record } from 'immutable'

import JobHistoryTypeEnum from './JobHistoryTypeEnum'

const JobHistoryEventRecord = Record({
  id: null,
  jobID: null,
  jobFileID: null,
  taskID: null,
  createdAt: null,
  type: null,
})

const JobHistoryEvent = (attrs) => {
  const { type } = attrs

  if (JobHistoryTypeEnum.includes(type) === false) {
    throw new Error(`Invalid Job History type: ${attrs.type}`)
  }

  return JobHistoryEventRecord({
    id: uuid.v4(),
    createdAt: new Date().toISOString(),
    ...attrs,
  })
}

export default JobHistoryEvent
