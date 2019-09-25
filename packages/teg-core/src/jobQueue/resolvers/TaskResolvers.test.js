import typeDefs from '@tegapp/schema'

import deterministicTestSetup from '../../util/testing/deterministicTestSetup'
import snapshotTestResolvers from '../../util/testing/snapshotTestResolvers'

import { initialState as spoolState } from '../../spool/reducers/spoolReducer'

import Task from '../types/Task'

describe('TaskResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()
    const task = Task({
      name: 'test task',
      data: ['g1 x10', 'g1 y20'],
    })

    const state = {
      spool: spoolState.setIn(['tasks', task.id], task),
      config: {
        printer: {
          id: 'test_printer_id',
        },
      },
    }

    snapshotTestResolvers({
      typeDefs,
      typeName: 'Task',
      rootValue: task,
      contextValue: {
        store: {
          getState: () => state,
        },
      },
    })
  })
})
