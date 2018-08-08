import { fromJS } from 'immutable'

import { SPOOL_TASK } from 'tegh-server'

const toJS = val => fromJS(val).toJS()

const filterDynamicAttrs = action => {
  if (action.type !== SPOOL_TASK) return action
  const filtered = toJS(action)
  if (filtered.payload != null && filtered.payload.task != null) {
    filtered.payload.task.id = '[REDACTED]'
    filtered.payload.task.createdAt = '[REDACTED]'
  }
  return filtered
}

const expectSimilarActions = (actual, expected) => {
  expect(actual.map(filterDynamicAttrs))
    .toMatchObject(expected.map(filterDynamicAttrs))
}

export default expectSimilarActions
