import { List } from 'immutable'

import getTaskPercentComplete from './getTaskPercentComplete'
import {
  PRINTING,
} from '../types/TaskStatusEnum'

describe(getTaskPercentComplete, () => {
  it('returns the percent complete', () => {
    const task = {
      status: PRINTING,
      currentLineNumber: 123456,
      data: {
        size: 10 * 100000,
      },
    }
    const state = { tasks: List([task]) }
    const result = getTaskPercentComplete(state)({ taskID: task.id, digits: 2 })

    expect(result).toEqual(12.35)
  })
})
