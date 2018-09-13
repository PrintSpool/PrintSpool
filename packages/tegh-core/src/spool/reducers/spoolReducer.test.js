import { List } from 'immutable'
import Task from '../types/Task'
import { DELETE_ITEM } from '../../util/ReduxNestedMap'

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
import { CANCEL_JOB } from '../../jobQueue/actions/cancelJob'
/* task actions */
import deleteTasks, { DELETE_TASKS } from '../actions/deleteTasks'
import { SPOOL_TASK } from '../actions/spoolTask'
import { CREATE_TASK } from '../actions/createTask'
import { REQUEST_DESPOOL } from '../actions/requestDespool'
import { DESPOOL_TASK } from '../actions/despoolTask'
import { START_TASK } from '../actions/startTask'
import { CANCEL_ALL_TASKS } from '../actions/cancelAllTasks'

let spoolReducer
let initialState

describe('spoolReducer', () => {
  const mockTaskReducerWith = (implementation) => {
    beforeEach(() => {
      jest.resetModules()
      jest.doMock('./taskReducer', () => jest.fn(implementation))
      // eslint-disable-next-line global-require
      const m = require('./spoolReducer')
      spoolReducer = m.default()
      // eslint-disable-next-line prefer-destructuring
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

  spoolResetActions.forEach((type) => {
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

  passThroughActions.forEach((type) => {
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

  describe(DELETE_TASKS, () => {
    mockTaskReducerWith((state, action) => action)

    it('passes the action through', () => {
      const taskID = 'A'
      const action = deleteTasks({ ids: [taskID] })
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
      if (taskAction.type === CREATE_TASK) return taskAction.payload.task
      if (taskAction.type === CANCEL_ALL_TASKS) return DELETE_ITEM
      return state
    })

    describe('when no other tasks are spooled', () => {
      it('creates the task and despools the first line', () => {
        const state = initialState

        const result = spoolReducer(state, action)

        const nextAction = result[1].actionToDispatch

        expect(result[0].tasks.get(spooledTaskID)).not.toBe(null)
        expect(nextAction.type).toEqual(REQUEST_DESPOOL)
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

      describe('and it is an emergency', () => {
        const task = Task({
          name: 'test.ngc',
          priority: EMERGENCY,
          internal: false,
          data: ['g1 x10', 'g1 y20'],
        })
        const emergencyAction = {
          type: SPOOL_TASK,
          payload: { task },
        }

        it('cancels other tasks', () => {
          const state = initialState.setIn(
            ['tasks', 'cancelled_task_id'],
            Task({
              name: 'cancelled_task.ngc',
              priority: NORMAL,
              internal: false,
              data: ['g1 x10', 'g1 y20'],
            }),
          )
          const result = spoolReducer(state, emergencyAction)

          const nextAction = result[1].actionToDispatch

          expect(result[0].tasks.size).toEqual(1)
          expect(result[0].tasks.get(task.id)).toEqual(task)
          expect(nextAction.type).toEqual(REQUEST_DESPOOL)
        })
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

  describe(REQUEST_DESPOOL, () => {
    const action = {
      type: REQUEST_DESPOOL,
    }

    mockTaskReducerWith((state, taskAction) => ({
      ...(state ? state.toJS() : {}),
      action: taskAction,
    }))

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
          .setIn(['tasks', 'emergency_1'], Task({
            priority: 'EMERGENCY',
            internal: true,
            name: 'emergency_1',
            data: ['g1 x10', 'g1 y10'],
          }))

        const result = spoolReducer(state, action)

        expect(result[0].currentTaskID).toEqual('emergency_1')
        expect(
          result[0].tasks.get('emergency_1').action.type,
        ).toEqual(START_TASK)
        expect(result[0].priorityQueues.get(EMERGENCY).toJS()).toEqual([
          'emergency_2',
        ])
        expect(result[1].actionToDispatch.type).toEqual(DESPOOL_TASK)
        expect(result[1].actionToDispatch.payload.task).toEqual(
          result[0].tasks.get('emergency_1'),
        )
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
          const task = Task({
            id: taskID,
            name: 'test.ngc',
            priority: EMERGENCY,
            internal: false,
            data: ['g1 x10'],
            status: PRINTING,
          })
          const state = initialState
            .set('currentTaskID', taskID)
            .setIn(['tasks', taskID], task)

          const result = spoolReducer(state, action)

          expect(result[0].currentTaskID).toEqual(taskID)
          expect(result[0].tasks.get(taskID).action.type).toEqual(REQUEST_DESPOOL)
          expect(result[1].actionToDispatch.payload.task.id).toEqual(taskID)
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
          expect(result.tasks.get(taskID).action.type).toEqual(REQUEST_DESPOOL)
        })
      })
    })
  })
})
