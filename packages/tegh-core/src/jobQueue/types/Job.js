// @flow
import uuid from 'uuid/v4'
import { Record } from 'immutable'

import type { RecordOf } from 'immutable'

export type JobT = RecordOf<{
  id: string,
  name: string,
  createdAt: ?number,
  quantity: number,
}>

const JobRecord = Record({
  id: null,
  name: null,
  createdAt: null,
  quantity: 1,
})

const Job = attrs => JobRecord({
  id: uuid(),
  createdAt: new Date().toISOString(),
  ...attrs,
})

export default Job
