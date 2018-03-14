// @flow
import uuid from 'uuid/v4'
import { Record, List } from 'immutable'

import type { RecordOf, List as ListType } from 'immutable'

export type JobFileT = RecordOf<{
  name: string,
  filePath: string,
  isTmpFile: boolean,
  quantity: number,
}>

const JobFileRecord = Record({
  id: null,
  name: null,
  filePath: null,
  isTmpFile: null,
  quantity: null,
})

const JobFile = attrs => JobFileRecord({
  ...attrs,
  id: uuid(),
})

export default JobFile
