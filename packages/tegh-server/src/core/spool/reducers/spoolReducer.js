import { merge, Record, List, Map } from 'immutable'

import ReduxNestedMap from '../../util/ReduxNestedMap'
import taskReducer from './taskReducer'
import { priorityOrder } from '../types/PriorityEnum'

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
import { DESPOOL_TASK } from '../actions/despoolTask'
import createTask from '../actions/createTask'
import startTask from '../actions/startTask'

const taskMap = ReduxNestedMap({
  singularReducer: taskReducer,
  keyPath: ['tasks']
})

export const initialState = Record({
  priorityQueues: Record({
    emergency: List(),
    preemptive: List(),
    normal: List(),
  })(),
  tasks: Map(),
  currentTaskID: null,
  sendSpooledLineToPrinter: false,
})()

const spoolReducer = (state = initialState, action) => {
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
    // case DELETE_TASK: {
    //   return taskMap.updateOne(state, action, action.payload.id)
    // }
    case SPOOL_TASK: {
      const { id, createTaskMicroAction } = action.payload
      let nextState = state

      /* create the task first */
      nextState = taskMap.createOne(nextState, createTaskMicroAction)

      const task = nextState.tasks.get(id)
      const taskQueue = ['priorityQueues', task.priority]
      const shouldDespool = state.currentTaskID == null

      /*
       * update each existing task via the taskReducer
       */
      nextState = taskMap.updateEach(state, action)

      nextState = nextState
        .updateIn(taskQueue, list => list.push(task.id))
        .set('sendSpooledLineToPrinter', shouldDespool)

      if (shouldDespool) {
        /*
         * recurse into the reducer to despool the first line if nothing is
         * spooled
         */
        nextState = spoolReducer(nextState, despoolTask())
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
        nextState = taskMap.updateOne(state, action, currentTaskID)
      }
      const priority = priorityOrder.find(priority =>
        priorityQueues[priority].size > 0
      )
      if (priority == null) {
        nextState = nextState.set('currentTaskID', null)
        return nextState
      }
      const nextTaskID = state.priorityQueues[priority].first()
      /*
       * start the task via the taskReducer
       */
      nextState = taskMap.updateOne(nextState, startTask(), nextTaskID)

      return nextState
        .set('currentTaskID', nextTaskID)
        .updateIn(['priorityQueues', priority], list => list.shift())
    }
    default:
      return state
  }
}

export default spoolReducer
