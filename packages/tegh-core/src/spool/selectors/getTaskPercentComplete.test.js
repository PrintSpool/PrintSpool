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
    const result = getTaskPercentComplete({ task, digits: 2 })

    expect(result).toEqual(12.35)
  })
})
