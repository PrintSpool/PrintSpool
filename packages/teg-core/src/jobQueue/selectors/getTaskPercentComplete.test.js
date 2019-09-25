import getTaskPercentComplete from './getTaskPercentComplete'

import { MockTask } from '../types/Task'
import { START_TASK } from '../types/TaskStatusEnum'

describe(getTaskPercentComplete, () => {
  it('returns the percent complete', () => {
    const task = MockTask({
      status: PRINTING,
      currentLineNumber: 123456,
    }).set('data', { size: 10 * 100000 })

    const result = getTaskPercentComplete({ task, digits: 2 })

    expect(result).toEqual(12.35)
  })
})
