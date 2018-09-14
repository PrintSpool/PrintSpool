import { List } from 'immutable'
import SagaTester from 'redux-saga-tester'

import Task from '../types/Task'
import { NORMAL } from '../types/PriorityEnum'
import deleteTasks from '../actions/deleteTasks'

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
  const tasksPendingDeletion = List([
    mockTask(),
    mockTask(),
  ])

  beforeEach(async () => {
    // delete require.cache[require.resolve('./taskDeletionSaga')]
    // delete require.cache[require.resolve('../selectors/getTasksPendingDeletion')]
    // jest.resetModules()
    jest.doMock('../selectors/getTasksPendingDeletion', () => {
      const implementation = () => tasksPendingDeletion
      return jest.fn(implementation)
    })
    // require('../selectors/getTasksPendingDeletion')
    // eslint-disable-next-line global-require
    taskDeletionSaga = require('./taskDeletionSaga').default
    await new Promise(resolve => setImmediate(resolve))
  })

  it('deletes the tasks pending deletion', async () => {
    const action = { type: 'SOME_ACTION' }

    const sagaTester = createTester()
    sagaTester.dispatch(action)

    const result = sagaTester.getCalledActions()

    expect(result).toMatchObject([
      action,
      deleteTasks({
        ids: tasksPendingDeletion.map(({ id }) => id).toList(),
      }),
    ])
  })

  afterEach(() => {
    jest.unmock('../selectors/getTasksPendingDeletion')
  })
})
