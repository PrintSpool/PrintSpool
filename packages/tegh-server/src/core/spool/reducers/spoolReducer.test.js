import { List, Map } from 'immutable'
import Task from '../types/Task'

import {
  EMERGENCY,
  NORMAL,
} from '../types/PriorityEnum'

import {
  PRINTING,
  DONE,
} from '../types/TaskStatusEnum'

/* printer actions */
import { PRINTER_READY } from '../../printer/actions/printerReady'
import { ESTOP } from '../../printer/actions/estop'
import { DRIVER_ERROR } from '../../printer/actions/driverError'
/* job actions */
import { CREATE_JOB } from '../../jobQueue/actions/createJob'
import { CANCEL_JOB } from '../../jobQueue/actions/cancelJob'
import { DELETE_JOB } from '../../jobQueue/actions/deleteJob'
/* task actions */
import { DELETE_TASK } from '../actions/deleteTask'
import { SPOOL_TASK } from '../actions/spoolTask'
import { CREATE_TASK } from '../actions/createTask'
import { DESPOOL_TASK } from '../actions/despoolTask'
import { START_TASK } from '../actions/startTask'

let taskReducer, spoolReducer, initialState

describe('spoolReducer', () => {
  const mockTaskReducerWith = implementation => {
    beforeEach(() => {
      jest.resetModules()
      jest.doMock('./taskReducer', () => {
        return jest.fn(implementation)
      })
      const m = require('./spoolReducer')
      spoolReducer = m.default
      initialState = m.initialState
    })

    afterEach(() => {
      jest.unmock('./taskReducer')
    })
  }

  const spoolResetActions = [
    PRINTER_READY,
    ESTOP,
    DRIVER_ERROR,
  ]

  spoolResetActions.forEach(type => {
    describe(type, () => {
      mockTaskReducerWith(() => null)

      it('resets the priority queues', () => {
        const state = initialState.set('priorityQueues', 'VALUE BEFORE RESET')
        const action = { type }

        const result = spoolReducer(state, action)

        expect(result.priorityQueues).toEqual(initialState.priorityQueues)
      })
    })
  })

  const passThroughActions = [
    ...spoolResetActions,
    CANCEL_JOB,
  ]

  passThroughActions.forEach(type => {
    describe(type, () => {
      mockTaskReducerWith((state, action) => ({ state, action }))

      it('passes through the action', () => {
        const state = initialState.mergeIn(['tasks'], {
          a: 'A',
          b: 'B',
        })
        const action = { type }

        const result = spoolReducer(state, action)

        expect(result.tasks.toJS()).toEqual({
          a: { state: 'A', action },
          b: { state: 'B', action },
        })
      })
    })
  })

  describe(DELETE_TASK, () => {
    mockTaskReducerWith((state, action) => action)

    it('passes the action through', () => {
      const taskID = 'A'
      const action = {
        type: DELETE_TASK,
        payload: { id: taskID }
      }
      const state = initialState
        .setIn(['tasks', taskID], Task({
          id: taskID,
          name: 'test.ngc',
          priority: EMERGENCY,
          internal: false,
          data: ['g1 x10'],
        }))

      const result = spoolReducer(state, action)

      expect(result.tasks.get(taskID)).toEqual(action)
    })
  })

  describe(SPOOL_TASK, () => {
    const action = {
      type: SPOOL_TASK,
      payload: {
        task: Task({
          name: 'test.ngc',
          priority: NORMAL,
          internal: false,
          data: ['g1 x10'],
        }),
      },
    }
    const spooledTaskID = action.payload.task.id

    mockTaskReducerWith((state, taskAction) => {
      return taskAction.type === CREATE_TASK ? taskAction.payload.task : state
    })

    describe('when no other tasks are spooled', () => {
      it('creates the task and despools the first line', () => {
        const state = initialState

        const result = spoolReducer(state, action)

        expect(result.tasks.get(spooledTaskID)).not.toBe(null)
        expect(result.currentTaskID).toEqual(spooledTaskID)
        expect(result.priorityQueues.get(EMERGENCY).toJS()).toEqual([])
      })
    })

    describe('when other tasks are spooled', () => {
      it('creates the task and adds it to the priority queue', () => {
        const state = initialState.set('currentTaskID', 'something')

        const result = spoolReducer(state, action)

        expect(result.tasks.get(spooledTaskID)).not.toBe(null)
        expect(result.currentTaskID).toEqual(state.currentTaskID)
        expect(result.priorityQueues.get(NORMAL).toJS()).toEqual([
          spooledTaskID,
        ])
      })

      describe('and a job is already spooled', () => {
        it('throws an error if the task is not an emergency', () => {
          const state = initialState.setIn(['tasks', 'abc'], Task({
            name: 'test_job.ngc',
            priority: NORMAL,
            status: PRINTING,
            internal: false,
            jobID: 'abc',
            data: ['g1 x10', 'g1 y20'],
          }))

          expect(() => {
            spoolReducer(state, action)
          }).toThrow()
        })
      })
    })
  })

  describe(DESPOOL_TASK, () => {
    const action = {
      type: DESPOOL_TASK,
    }

    mockTaskReducerWith((state, action) => {
      return {
        ...(state ? state.toJS() : {}),
        action,
      }
    })

    describe('if there is not a currentTask', () => {
      it('starts the top priority task', () => {
        const state = initialState
          .setIn(['priorityQueues', NORMAL], List([
            'normal_1',
          ]))
          .setIn(['priorityQueues', EMERGENCY], List([
            'emergency_1',
            'emergency_2',
          ]))

        const result = spoolReducer(state, action)

        expect(result.currentTaskID).toEqual('emergency_1')
        expect(result.tasks.get('emergency_1').action.type).toEqual(START_TASK)
        expect(result.priorityQueues.get(EMERGENCY).toJS()).toEqual([
          'emergency_2'
        ])
      })

      describe('and there is nothing in the queue', () => {
        it('does nothing', () => {
          const state = initialState

          const result = spoolReducer(state, action)

          expect(result.currentTaskID).toEqual(null)
        })
      })
    })

    describe('if there is a currentTask', () => {
      describe('with lines left', () => {
        it('despools the task via the taskReducer', () => {
          const taskID = 'A'
          const state = initialState
            .set('currentTaskID', taskID)
            .setIn(['tasks', taskID], Task({
              name: 'test.ngc',
              priority: EMERGENCY,
              internal: false,
              data: ['g1 x10'],
              status: PRINTING,
            }))

          const result = spoolReducer(state, action)

          expect(result.currentTaskID).toEqual(taskID)
          expect(result.tasks.get(taskID).action.type).toEqual(DESPOOL_TASK)
        })
      })

      describe('with no lines left', () => {
        it('finishes the task and then despools the next task', () => {
          const taskID = 'A'
          const state = initialState
            .set('currentTaskID', taskID)
            .setIn(['tasks', taskID], Task({
              name: 'test.ngc',
              priority: EMERGENCY,
              internal: false,
              data: ['g1 x10'],
              status: DONE,
            }))

          const result = spoolReducer(state, action)

          expect(result.currentTaskID).toEqual(null)
          expect(result.tasks.get(taskID).action.type).toEqual(DESPOOL_TASK)
        })
      })
    })
  })
})
