import { fromJS } from 'immutable'

const toJS = val => fromJS(val).toJS()

const filterDynamicAttrs = action => {
  if (action.type !== 'SPOOL') return action
  const filtered = toJS(action)
  filtered.task.id = '[REDACTED]'
  filtered.task.createdAt = '[REDACTED]'
  return filtered
}

const expectSimilarActions = (actual, expected) => {
  expect(actual.map(filterDynamicAttrs))
    .toEqual(expected.map(filterDynamicAttrs))
}

export default expectSimilarActions
