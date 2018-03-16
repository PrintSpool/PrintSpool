import { merge, Record, List, Map } from 'immutable'

import ReduxNestedMap from '../../util/ReduxNestedMap'
import taskReducer from './taskReducer'
import isIdle from '../selectors/isIdle'

import {
  EMERGENCY,
  NORMAL,
  PREEMPTIVE,
  priorityOrder,
} from '../types/PriorityEnum'

import { PRINTING } from '../types/TaskStatusEnum'

/* printer actions */
import { PRINTER_READY } from '../../printer/actions/printerReady'
import { ESTOP } from '../../printer/actions/estop'
import { DRIVER_ERROR } from '../../printer/actions/driverError'
/* job actions */
import { CREATE_JOB } from '../../jobQueue/actions/createJob'
import { CANCEL_JOB } from '../../jobQueue/actions/cancelJob'
import { DELETE_JOB } from '../../jobQueue/actions/deleteJob'
/* task actions */
import { SPOOL_TASK } from '../actions/spoolTask'
import despoolTask, { DESPOOL_TASK } from '../actions/despoolTask'
import createTask from '../actions/createTask'
import { DELETE_TASK } from '../actions/deleteTask'
import startTask from '../actions/startTask'

const taskMap = ReduxNestedMap({
  singularReducer: taskReducer,
  keyPath: ['tasks']
})

export const initialState = Record({
  priorityQueues: Record({
    [EMERGENCY]: List(),
    [PREEMPTIVE]: List(),
    [NORMAL]: List(),
  })(),
  tasks: Map(),
  currentTaskID: null,
  sendSpooledLineToPrinter: false,
})()

const spoolReducer = () => (state = initialState, action) => {
  switch (action.type) {
    /* Spool reset actions */
    case PRINTER_READY:
    case ESTOP:
    case DRIVER_ERROR: {
      const nextState = taskMap.updateEach(state, action)

      return nextState
        .set('priorityQueues', initialState.priorityQueues)
    }
    case CANCEL_JOB:
    case DELETE_JOB: {
      return taskMap.updateEach(state, action)
    }
    case DELETE_TASK: {
      return taskMap.updateOne(state, action, action.payload.id)
    }
    case SPOOL_TASK: {
      const { payload } = action
      const { id, priority } = payload.task
      let nextState = state

      if (isIdle.resultFunc(state.tasks) === false && priority !== EMERGENCY) {
        throw new Error('Cannot spool non-emergency tasks when printing a job')
      }

      /* create the task first */
      const createAction = createTask({ task: payload.task })
      nextState = taskMap.createOne(nextState, createAction)

      const task = nextState.tasks.get(id)
      const taskQueue = ['priorityQueues', task.priority]
      const shouldDespool = state.currentTaskID == null

      /*
       * update each existing task via the taskReducer
       */
      nextState = taskMap.updateEach(nextState, action)

      nextState = nextState
        .updateIn(taskQueue, list => list.push(task.id))
        .set('sendSpooledLineToPrinter', shouldDespool)

      if (shouldDespool) {
        /*
         * recurse into the reducer to despool the first line if nothing is
         * spooled
         */
        nextState = spoolReducer()(nextState, despoolTask())
      }
      return nextState
    }
    case DESPOOL_TASK: {
      const { priorityQueues, currentTaskID } = state
      let nextState = state
      if (currentTaskID != null) {
        /*
         * despool the next line or finish the task via the taskReducer
         */
        nextState = taskMap.updateOne(nextState, action, currentTaskID)
      }
      const currentTask = nextState.tasks.get(currentTaskID)
      if (currentTask == null || currentTask.status != PRINTING) {
        /*
         * if the current task is done then despool the next task if there is
         * anything to despool.
         */
        const priority = priorityOrder.find(priority =>
          priorityQueues[priority].size > 0
        )
        if (priority == null) {
          nextState = nextState.set('currentTaskID', null)
        } else {
          const nextTaskID = state.priorityQueues[priority].first()
          /*
           * start the task via the taskReducer
           */
          nextState = taskMap.updateOne(nextState, startTask(), nextTaskID)

          nextState = nextState
            .set('currentTaskID', nextTaskID)
            .updateIn(['priorityQueues', priority], list => list.shift())
        }
      }
      return nextState
    }
    default:
      return state
  }
}

export default spoolReducer
