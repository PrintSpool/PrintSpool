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
  createTask,
} from '../actions/taskActions'

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

const taskMap = ReduxNestedMap({
  singularReducer: taskReducer,
  keyPath: ['allTasks']
})

const spoolReducer = (
  state: SpoolState = initialState,
  action: SpoolAction | DespoolAction,
) => {
  switch (action.type) {
    /* Spool reset actions */
    case 'PRINTER_READY':
    case 'ESTOP':
    case 'DRIVER_ERROR': {
      const nextState = taskMap.updateEach(state, action)

      return nextState
        .set('priorityQueues', initialState.priorityQueues)
    }
    case CREATE_JOB: {
      let nextState = state
      const newTasks = action.tasks.forEach(task => {
        /*
         * use the task reducer to initialize the state of each task in the job
         */
        const itemAction = createTask({ task })
        nextState = taskMap.createOne(state, itemAction)
      })
      return nextState
    }
    case CANCEL_JOB:
    case DELETE_JOB: {
      return taskMap.updateEach(state, action)
    }
    case CREATE_TASK: {
      /*
       * use the task reducer to initialize the task state
       */
       return taskMap.createOne(state, action)
    }
    case SPOOL_TASK: {
      const { task } = action
      const taskQueue = ['priorityQueues', task.priority]

      let nextState = taskMap.updateEach(state, action)

      nextState = nextState
        .updateIn(taskQueue, list => list.push(task.id))

      const shouldDespool = nextState.currentTaskID == null
      if (shouldDespool) {
        /*
         * recurse into the reducer to despool the first line if nothing is
         * spooled
         */
        nextState = spoolReducer(nextState, despoolTask())
      }
      return nextState
        .set('sendSpooledLineToPrinter', shouldDespool)
    }
    case DESPOOL_TASK: {
      const { priorityQueues, currentTaskID } = state
      let nextState = state
      if (currentTaskID != null) {
        let task = state.allTasks.get(currentTaskID)
        task = taskReducer(task, action)
        if (task == null) {
          nextState = nextState.update('allTasks', tasks =>
            tasks.delete(task.id)
          )
        } else {
          nextState = nextState.setIn(['allTasks', task.id], task)
        }
      }
      const priority = priorityOrder.find(priority =>
        priorityQueues[priority].size > 0
      )
      if (priority == null) {
        return nextState.set('currentTaskID', null)
      }
      const nextTaskID = state.priorityQueues[priority].first()
      return nextState
        .set('currentTaskID', nextTaskID)
        // todo: move to task reducer
        .mergeIn(['allTasks', nextTaskID], {
          startedAt: new Date().toISOString(),
          currentLineNumber: 0,
        })
        .updateIn(['priorityQueues', priority], list => list.shift())
    }
    default:
      return state
  }
}

export default spoolReducer
