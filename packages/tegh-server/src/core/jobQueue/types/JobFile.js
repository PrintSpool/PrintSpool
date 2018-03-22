// @flow
import uuid from 'uuid/v4'
import { Record, List } from 'immutable'

import type { RecordOf, List as ListType } from 'immutable'

export type JobFileT = RecordOf<{
  name: string,
  filePath: string,
  isTmpFile: boolean,
  quantity: number,
  jobID: string,
}>

const JobFileRecord = Record({
  id: null,
  name: null,
  filePath: null,
  isTmpFile: null,
  quantity: null,
  jobID: null,
})

const JobFile = attrs => JobFileRecord({
  id: uuid(),
  ...attrs,
})

export default JobFile
