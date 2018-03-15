// @flow
import { utils as sagaUtils } from 'redux-saga'
import SagaTester from 'redux-saga-tester'
const { SAGA_ACTION } = sagaUtils

import Task from '../types/Task'
import { NORMAL } from '../types/PriorityEnum'
import deleteTask from '../actions/deleteTask'

let taskDeletionSaga

const createTester = () => {
  const sagaTester = new SagaTester({ initialState: {} })
  sagaTester.start(taskDeletionSaga)
  return sagaTester
}

const mockTask = () => Task({
  name: 'test.ngc',
  priority: NORMAL,
  internal: false,
  data: ['g1 x10', 'g1 y20'],
})

describe('When an action is taken', () => {
  const tasksPendingDeletion = [
    mockTask(),
    mockTask(),
  ]

  beforeEach(async function() {
    // delete require.cache[require.resolve('./taskDeletionSaga')]
    // delete require.cache[require.resolve('../selectors/getTasksPendingDeletion')]
    // jest.resetModules()
    jest.doMock('../selectors/getTasksPendingDeletion', () => {
      const implementation = () => tasksPendingDeletion
      return jest.fn(implementation)
    })
    // require('../selectors/getTasksPendingDeletion')
    taskDeletionSaga = require('./taskDeletionSaga').default
    await new Promise(resolve => setImmediate(resolve))
  })

  it('deletes the tasks pending deletion', async () => {
    const action = { type: 'SOME_ACTION' }

    const sagaTester = createTester()
    sagaTester.dispatch(action)

    const result = sagaTester.getCalledActions()

    expect(result).toEqual([
      action,
      {
        ...deleteTask({ id: tasksPendingDeletion[0].id }),
        [SAGA_ACTION]: true,
      },
      {
        ...deleteTask({ id: tasksPendingDeletion[1].id }),
        [SAGA_ACTION]: true,
      },
    ])
  })

  afterEach(() => {
    jest.unmock('../selectors/getTasksPendingDeletion')
  })

})
