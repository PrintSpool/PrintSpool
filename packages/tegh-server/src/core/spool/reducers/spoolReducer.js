import { merge, Record, List, Map } from 'immutable'
import ReduxNestedMap from '../util/ReduxNestedMap'
import taskReducer from './taskReducer'
import { priorityOrder } from '../types/Priority'
import {
  CREATE_JOB,
  CANCEL_JOB,
  DELETE_JOB,
} from '../../jobQueue/actions/JobActions'
import {
  CREATE_TASK,
  SPOOL_TASK,
  DESPOOL_TASK,
  DELETE_TASK
  createTask,
  startTask,
} from '../actions/taskActions'

const taskMap = ReduxNestedMap({
  singularReducer: taskReducer,
  keyPath: ['allTasks']
})

const initialState = Record({
  priorityQueues: Record({
    emergency: List(),
    preemptive: List(),
    normal: List(),
  })(),
  allTasks: Map(),
  currentTaskID: null,
  sendSpooledLineToPrinter: false,
})()

const spoolReducer = (state = initialState, action) => {
  switch (action.type) {
    /* Spool reset actions */
    case 'PRINTER_READY':
    case 'ESTOP':
    case 'DRIVER_ERROR': {
      const nextState = taskMap.updateEach(state, action)

      return nextState
        .set('priorityQueues', initialState.priorityQueues)
    }
    case CANCEL_JOB:
    case DELETE_JOB: {
      return taskMap.updateEach(state, action)
    }
    case CREATE_TASK: {
       return taskMap.createOne(state, action)
    }
    case DELETE_TASK: {
      return taskMap.updateOne(state, action, action.payload.id)
    }
    case SPOOL_TASK: {
      const { id, createTaskMicroAction } = action.payload
      let nextState = state

      if (createTaskMicroAction) {
        /* run the createTask micro action first if it is present */
        nextState = taskMap.createOne(nextState, createTaskMicroAction)
      }

      const task = nextState.allTasks.get(id)
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
