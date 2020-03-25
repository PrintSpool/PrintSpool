import uuid from 'uuid'
import { Record } from 'immutable'

// export type JobT = RecordOf<{
//   id: string,
//   name: string,
//   createdAt: ?number,
//   quantity: number,
// }>

const JobRecord = Record({
  id: null,
  name: null,
  createdAt: null,
  meta: null,
  quantity: 1,
})

const Job = attrs => JobRecord({
  id: attrs.id || uuid.v4(),
  createdAt: new Date().toISOString(),
  meta: attrs.meta || {},
  ...attrs,
})

export const MockJob = attrs => Job({
  name: 'test.ngc',
  ...attrs,
})


export default Job
