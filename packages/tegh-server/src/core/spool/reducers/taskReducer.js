import { merge, Record, List, Map } from 'immutable'
import { DELETE_ITEM } from '../util/ReduxNestedMap'
import {
  CANCEL_JOB,
  DELETE_JOB,
} from '../../jobQueue/actions/jobActions'
import {
  CREATE_TASK,
  SPOOL_TASK,
  DESPOOL_TASK,
} from '../actions/taskActions'

const spoolReducer = (
  state,
  action,
) => {
  switch (action.type) {
    /* Spool reset actions */
    case 'PRINTER_READY':
    case 'ESTOP':
    case 'DRIVER_ERROR': {
      if (state.internal) return DELETE_ITEM
      if (state.status === 'queued' || state.status === 'printing') {
        const status = action.type === 'DRIVER_ERROR' ? 'errored' : 'cancelled'
        return state.set('state', status)
      }
      return state
    }
    case CANCEL_JOB: {
      const { jobID } = action
      if (state.jobID !== jobID) return state
      return state.set('status', 'cancelled')
    }
    case DELETE_JOB: {
      const { jobID } = action
      if (state.jobID !== jobID) return state
      return DELETE_ITEM
    }
    case CREATE_TASK: {
      return action.task
    }
    case SPOOL_TASK: {
      const { task } = action
      if (!priorityOrder.includes(task.priority)) {
        throw new Error(`Invalid priority ${task.priority}`)
      }
      if (task.id === state.id) return task
      let nextState = state
      if (
        task.priority === 'emergency' &&
        ['queued', 'printing'].includes(state.status)
      ) {
        /*
         * Emergency tasks cancel and pre-empt queued and printing tasks
         */
         nextState = nextState.set('status', 'cancelled')
      }
      return nextState
    }
    case DESPOOL_TASK: {
      if (state.currentLineNumber < state.data.size - 1) {
        // if the task has more lines to execute then increment the line number
        return state.update('currentLineNumber', i => i + 1)
      }
      if (state.internal) {
        // Delete internal tasks after they are completed
        return DELETE_ITEM
      } else {
        // mark public tasks as done after they are completed
        return state.merge({
          // TODO: stoppedAt should eventually be changed to be sent after
          // the printer sends 'ok' or 'error' and should be based off
          // estimated print time
          stoppedAt: new Date().toISOString(),
          status: 'done',
          // the data of each completed task is deleted to save space.
          data: null,
        })
      }
    }
    default: {
      return state
    }
  }
}

export default spoolReducer
