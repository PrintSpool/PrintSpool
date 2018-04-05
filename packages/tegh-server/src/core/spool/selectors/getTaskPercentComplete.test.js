import getTaskPercentComplete from './getTaskPercentComplete'
import {
  PRINTING,
  DONE,
} from '../types/TaskStatusEnum'

describe(getTaskPercentComplete, () => {
  it(`returns the percent complete`, () => {
    const task = {
      status: PRINTING,
      currentLineNumber: 123456,
      data: {
        size: 10*100000,
      },
    }
    const result = getTaskPercentComplete({task, digits: 2})

    expect(result).toEqual(12.35)
  })

  it('returns 100% for DONE tasks', () => {
    const task = {
      status: DONE,
      currentLineNumber: 888888,
      data: null,
    }
    const result = getTaskPercentComplete({task, digits: 1})

    expect(result).toEqual(100.0)
  })
})
