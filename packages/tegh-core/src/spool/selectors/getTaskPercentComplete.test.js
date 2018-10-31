import getTaskPercentComplete from './getTaskPercentComplete'

import { initialState } from '../reducers/spoolReducer'
import { MockTask } from '../types/Task'
import { PRINTING } from '../types/TaskStatusEnum'

describe(getTaskPercentComplete, () => {
  it('returns the percent complete', () => {
    const task = MockTask({
      status: PRINTING,
      currentLineNumber: 123456,
    }).set('data', { size: 10 * 100000 })

    const state = initialState
      .setIn(['tasks', task.id], task)

    const result = getTaskPercentComplete(state)({ taskID: task.id, digits: 2 })

    expect(result).toEqual(12.35)
  })
})
