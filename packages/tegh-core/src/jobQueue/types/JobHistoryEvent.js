import uuid from 'uuid/v4'
import { Record } from 'immutable'

import JobHistoryTypeEnum, { STARTED } from './JobHistoryTypeEnum'

const JobHistoryEventRecord = Record({
  id: null,
  jobFileID: null,
  printerID: null,
  createdAt: null,
  type: null,
})

const JobHistoryEvent = (attrs) => {
  const { type, printerID } = attrs

  if (JobHistoryTypeEnum.includes(type) === false) {
    throw new Error(`Invalid Job History type: ${attrs.type}`)
  }
  if (printerID == null && type === STARTED) {
    throw new Error('printerID must not be null for type: STARTED')
  }

  return JobHistoryEventRecord({
    id: uuid(),
    createdAt: new Date().toISOString(),
    ...attrs,
  })
}

export default JobHistoryEvent
