import { List } from 'immutable'

import spoolReducer, { initialState } from './spoolReducer'

import { MockTask } from '../types/Task'

import {
  EMERGENCY,
  PREEMPTIVE,
  NORMAL,
} from '../types/PriorityEnum'

import {
  PRINTING,
} from '../types/TaskStatusEnum'

/* printer actions */
import { PRINTER_READY } from '../../printer/actions/printerReady'
import { ESTOP } from '../../printer/actions/estop'
import { DRIVER_ERROR } from '../../printer/actions/driverError'
/* job actions */
import deleteJob, { DELETE_JOB } from '../../jobQueue/actions/deleteJob'
/* task actions */
import cancelTask, { CANCEL_TASK } from '../actions/cancelTask'
import spoolTask, { SPOOL_TASK } from '../actions/spoolTask'
import requestDespool, { REQUEST_DESPOOL } from '../actions/requestDespool'
import { DESPOOL_TASK } from '../actions/despoolTask'

describe('spoolReducer', () => {
  const spoolResetActions = [
    PRINTER_READY,
    ESTOP,
    DRIVER_ERROR,
  ]

  spoolResetActions.forEach((type) => {
    describe(type, () => {
      it('resets the state', () => {
        const state = 'any state'
        const action = { type }

        const result = spoolReducer(state, action)

        expect(result).toEqual(initialState)
      })
    })
  })

  describe(DELETE_JOB, () => {
    const state = initialState
      .setIn(['tasks', 'job_task'], MockTask({ jobID: 'the_job' }))
      .setIn(['tasks', 'the_task'], MockTask({ taskID: 'the_task' }))
    const action = cancelTask({ taskID: 'the_task' })

    const nextState = spoolReducer(state, action)

    expect(nextState).toEqual(state.removeIn(['tasks', 'the_task']))
  })

  describe(CANCEL_TASK, () => {
    const state = initialState
      .setIn(['tasks', 'job_task'], MockTask({ jobID: 'the_job' }))
      .setIn(['tasks', 'other_task'], MockTask({ jobID: 'other_job' }))
    const action = deleteJob({ jobID: 'the_job' })

    const nextState = spoolReducer(state, action)

    expect(nextState).toEqual(state.removeIn(['tasks', 'job_task']))
  })

  describe(SPOOL_TASK, () => {
    describe('when no other tasks are spooled', () => {
      it('creates the task and despools the first line', () => {
        const task = MockTask()
        const action = spoolTask(task)

        const [
          nextState,
          { actionToDispatch: nextAction },
        ] = spoolReducer(initialState, action)

        expect(nextState.tasks.get(task.id)).toEqual(task)
        expect(nextState.priorityQueues[NORMAL].toArray()).toEqual([task.id])
        expect(nextAction.type).toEqual(REQUEST_DESPOOL)
      })
    })

    describe('when other tasks are spooled', () => {
      it('creates the task and adds it to the priority queue', () => {
        const task = MockTask()
        const action = spoolTask(task)
        const otherTaskID = 'OTHER_TASK_ID'

        const nextState = spoolReducer(
          initialState.set('currentTaskID', otherTaskID),
          action,
        )

        expect(nextState.currentTaskID).toEqual(otherTaskID)
        expect(nextState.tasks.get(task.id)).toEqual(task)
        expect(nextState.priorityQueues[NORMAL].toArray()).toEqual([task.id])
      })

      describe('and it is an emergency', () => {
        it('cancels other tasks and despools the emergency task', () => {
          const task = MockTask({ priority: EMERGENCY })
          const action = spoolTask(task)
          const otherTask = MockTask({ id: 'OTHER_TASK_ID' })

          const state = initialState
            .set('currentTaskID', otherTask.id)
            .setIn(['tasks', otherTask.id], otherTask)
            .setIn(['priorityQueues', NORMAL, 0], otherTask.id)

          const [
            nextState,
            { actionToDispatch: nextAction },
          ] = spoolReducer(state, action)

          expect(nextState.tasks.toJS()).toEqual({ [task.id]: task.toJS() })
          expect(nextState.priorityQueues[EMERGENCY].toArray()).toEqual([task.id])
          expect(nextState.priorityQueues[NORMAL].toArray()).toEqual([])
          expect(nextAction.type).toEqual(REQUEST_DESPOOL)
        })
      })

      describe('and a job is already spooled', () => {
        it('throws an error if the task is not internal or an emergency', () => {
          const task = MockTask({ internal: false })
          const action = spoolTask(task)
          const jobTask = MockTask({
            internal: false,
            jobID: 'abc',
            jobFileID: '123',
          })

          const state = initialState.setIn(['tasks', jobTask.id], jobTask)

          expect(() => {
            spoolReducer(state, action)
          }).toThrow()
        })
      })
    })
  })

  // TODO: next
  describe(REQUEST_DESPOOL, () => {
    const despoolNextTaskState = initialState
      .setIn(['priorityQueues', NORMAL], List([
        'normal_1',
      ]))
      .setIn(['priorityQueues', PREEMPTIVE], List([
        'preemptive_1',
        'preemptive_2',
      ]))
      .setIn(['tasks', 'preemptive_1'], MockTask({
        id: 'preemptive_1',
        priority: PREEMPTIVE,
      }))

    // TODO: loop through each despool next task scenario
    const despoolNextTaskScenarios = [
      {
        scenario: 'when the current task is done',
        state: (
          despoolNextTaskState
            .set('currentTaskID', 'finished_task')
            .setIn(['tasks', 'finished_task'], MockTask({
              id: 'finished_task',
              currentLineNumber: 2,
            }))
        ),
      },
      {
        scenario: 'if there is not a currentTask',
        state: despoolNextTaskState,
      },
    ]
    despoolNextTaskScenarios.forEach(({ scenario, state }) => {
      describe(scenario, () => {
        it('despools the next top priority task', () => {
          const action = requestDespool()

          const [
            nextState,
            { actionToDispatch: nextAction },
          ] = spoolReducer(state, action)

          expect(nextState.currentTaskID).toEqual('preemptive_1')
          expect(nextState.tasks.get('preemptive_1').status).toEqual(PRINTING)
          expect(nextState.priorityQueues.get(PREEMPTIVE).toJS()).toEqual([
            'preemptive_2',
          ])
          expect(nextAction.type).toEqual(DESPOOL_TASK)
          expect(nextAction.payload.task.id).toEqual('preemptive_1')
        })
      })
    })

    describe('if there are no tasks', () => {
      it('does nothing', () => {
        const state = initialState
        const action = requestDespool()

        const result = spoolReducer(state, action)

        expect(result).toEqual(initialState)
      })
    })

    describe('if there is a currentTask with lines left', () => {
      it('despools the next line of the task', () => {
        const action = requestDespool()
        const task = MockTask({
          status: PRINTING,
          currentLineNumber: 0,
        })
        const state = initialState
          .set('currentTaskID', task.id)
          .setIn(['tasks', task.id], task)

        const [
          nextState,
          { actionToDispatch: nextAction },
        ] = spoolReducer(state, action)

        expect(nextState.currentTaskID).toEqual(task.id)
        expect(nextState.tasks.get(task.id).currentLineNumber).toEqual(1)
        expect(nextAction.type).toEqual(DESPOOL_TASK)
        expect(nextAction.payload.task.id).toEqual(task.id)
      })
    })
  })
})
