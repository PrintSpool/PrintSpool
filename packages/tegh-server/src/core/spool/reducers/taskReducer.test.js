import { merge, Record, List, Map } from 'immutable'

import Task from '../types/Task'
import { DELETE_ITEM } from '../../util/ReduxNestedMap'
import { isSpooled } from '../types/PriorityEnum'
import {
  SPOOLED,
  PRINTING,
  ERRORED,
  CANCELLED,
  DONE,
} from '../types/TaskStatusEnum'

/* printer actions */
import { PRINTER_READY } from '../../printer/actions/printerReady'
import { ESTOP } from '../../printer/actions/estop'
import { DRIVER_ERROR } from '../../printer/actions/driverError'
/* job actions */
import { CANCEL_JOB } from '../../jobQueue/actions/cancelJob'
import { DELETE_JOB } from '../../jobQueue/actions/deleteJob'
/* task actions */
import { SPOOL_TASK } from '../actions/spoolTask'
import { DESPOOL_TASK } from '../actions/despoolTask'
import { CREATE_TASK } from '../actions/createTask'
import { START_TASK } from '../actions/startTask'

import taskReducer from './taskReducer'

describe('taskReducer', () => {
  const spoolResetActions = [
    { type: PRINTER_READY, expectedStatus: CANCELLED },
    { type: ESTOP, expectedStatus: CANCELLED },
    { type: DRIVER_ERROR, expectedStatus: ERRORED },
  ]

  spoolResetActions.forEach(({ type, expectedStatus }) => {
    describe(type, () => {
      const action = { type }

      describe('if the task is not spooled', () => {
        it('does nothing', () => {
          const state = Task({
            name: 'test.ngc',
            priority: 'emergency',
            internal: false,
            data: ['g1 x10', 'g1 y20'],
            status: 'DONE',
          })
          const result = taskReducer(state, action)

          expect(result).toEqual(state)
        })
      })

      describe('if the task is spooled', () => {
        it(`marks the task as ${expectedStatus}`, () => {
          const state = Task({
            name: 'test.ngc',
            priority: 'emergency',
            internal: false,
            data: ['g1 x10', 'g1 y20'],
            jobID: 'test_123'
          })
          const result = taskReducer(state, action)

          expect(result.status).toEqual(expectedStatus)
        })
      })
    })
  })

  describe(CANCEL_JOB, () => {
    const jobID = 'ABC'
    const action = {
      type: CANCEL_JOB,
      payload: { id: jobID }
    }

    describe('if the task belongs to the job', () => {
      it('marks the task as cancelled', () => {
        const state = Task({
          name: 'test.ngc',
          priority: 'emergency',
          internal: false,
          data: ['g1 x10', 'g1 y20'],
          jobID,
        })
        const result = taskReducer(state, action)

        expect(result.status).toEqual(CANCELLED)
      })
    })

    describe('if the task does not belong to the job', () => {
      it('does nothing', () => {
        const state = Task({
          name: 'test.ngc',
          priority: 'emergency',
          internal: false,
          data: ['g1 x10', 'g1 y20'],
          jobID: 'another_job',
        })
        const result = taskReducer(state, action)

        expect(result).toEqual(state)
      })
    })
  })

  describe(DELETE_JOB, () => {
    const jobID = 'ABC'
    const action = {
      type: DELETE_JOB,
      payload: { id: jobID }
    }

    describe('if the task belongs to the job', () => {
      it('deletes the task', () => {
        const state = Task({
          name: 'test.ngc',
          priority: 'emergency',
          internal: false,
          data: ['g1 x10', 'g1 y20'],
          jobID,
        })
        const result = taskReducer(state, action)

        expect(result).toEqual(DELETE_ITEM)
      })
    })

    describe('if the task does not belong to the job', () => {
      it('does nothing', () => {
        const state = Task({
          name: 'test.ngc',
          priority: 'emergency',
          internal: false,
          data: ['g1 x10', 'g1 y20'],
          jobID: 'another_job',
        })
        const result = taskReducer(state, action)

        expect(result).toEqual(state)
      })
    })
  })

  describe(CREATE_TASK, () => {
    const task = 'TEST'
    const action = {
      type: CREATE_TASK,
      payload: { task }
    }

    it('returns the task', () => {
      const result = taskReducer(null, action)

      expect(result).toEqual(task)
    })
  })

  describe(SPOOL_TASK, () => {

    describe('when a task is spooled with emergency priority', () => {
      const task = Task({
        name: 'test.ngc',
        priority: 'emergency',
        internal: false,
        data: ['g1 x10', 'g1 y20'],
      })
      const action = {
        type: SPOOL_TASK,
        payload: { task }
      }

      it('cancels other tasks', () => {
        const state = Task({
          name: 'test.ngc',
          priority: 'emergency',
          internal: false,
          data: ['g1 x10', 'g1 y20'],
        })
        const result = taskReducer(state, action)

        expect(result.status).toEqual(CANCELLED)
      })

      it('does not cancel itself', () => {
        const result = taskReducer(task, action)

        expect(result).toEqual(task)
      })
    })

    describe('when another task is spooled with non-emergency priority', () => {
      const task = Task({
        name: 'test.ngc',
        priority: 'normal',
        internal: false,
        data: ['g1 x10', 'g1 y20'],
      })
      const action = {
        type: SPOOL_TASK,
        payload: { task }
      }

      it('does nothing', () => {
        const state = Task({
          name: 'test.ngc',
          priority: 'emergency',
          internal: false,
          data: ['g1 x10', 'g1 y20'],
        })
        const result = taskReducer(state, action)

        expect(result).toEqual(state)
      })
    })
  })

  describe(START_TASK, () => {
    const action = { type: START_TASK }

    it('updates the task\'s properties', () => {
      const state = Task({
        name: 'test.ngc',
        priority: 'emergency',
        internal: false,
        data: ['g1 x10', 'g1 y20'],
      })

      const result = taskReducer(state, action)

      expect(result.startedAt).not.toEqual(null)
      expect(result.status).toEqual(PRINTING)
      expect(result.currentLineNumber).toEqual(0)
    })
  })

  describe(DESPOOL_TASK, () => {
    const action = { type: DESPOOL_TASK }

    describe('if the task is not finished', () => {
      it('increments the currentLineNumber', () => {
        const state = Task({
          name: 'test.ngc',
          priority: 'emergency',
          internal: false,
          data: ['g1 x10', 'g1 y20'],
          status: PRINTING,
        }).set('currentLineNumber', 0)
        const result = taskReducer(state, action)

        expect(result.currentLineNumber).toEqual(1)
        expect(result.status).toEqual(PRINTING)
      })
    })

    describe('if the task is finished', () => {
      it('marks the job as done and deletes it\'s data', () => {
        const state = Task({
          name: 'test.ngc',
          priority: 'emergency',
          internal: false,
          data: ['g1 x10', 'g1 y20'],
        }).set('currentLineNumber', 1)

        const result = taskReducer(state, action)

        expect(result.status).toEqual(DONE)
        expect(result.stoppedAt).not.toBe(null)
        expect(result.data).toBe(null)
      })
    })
  })

})
