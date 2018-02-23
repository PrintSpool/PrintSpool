// @flow
import uuid from 'uuid/v4'
import { Record, List } from 'immutable'

import type { RecordOf, List as ListType } from 'immutable'

export type JobFileT = RecordOf<{
  name: string,
  filePath: string,
  isTempFile: boolean,
  quantity: number,
}>

const JobFileRecord = Record({
  id: null,
  name: null,
  filePath: null,
  isTempFile: null,
  quantity: null,
})

const JobFile = attrs => JobFileRecord({
  ...attrs,
  id: uuid(),
  status: 'queued',
})

export default JobFile
