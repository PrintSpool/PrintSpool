// @flow
import { Record, List, Map } from 'immutable'

import type {
  SpoolAction,
  DespoolAction,
  Task,
  SpoolState
} from './spool_reducer_types'


const createSpoolState = Record({
  // file: null,
  manualSpool: List(),
  internalSpool: List(),
  printQueue: List(),
  allTasks: Map(),
  history: List(),
  currentTaskID: null,
  sendSpooledLineToPrinter: false,
})

const initialState: SpoolState = new createSpoolState()
const maxTaskHistoryLength = 3

const spoolReducer = (
  state: SpoolState = initialState,
  action: SpoolAction | DespoolAction,
) => {
  switch (action.type) {
    // case 'SPOOL_FILE':
    //   return {
    //     ...state,
    //     file: action.data
    //   }
    case 'SPOOL': {
      const { task } = action
      const { spoolName } = task
      if ([
        'manualSpool',
        'internalSpool',
        'printQueue',
      ].includes(spoolName) === false) {
        throw new Error(`Invalid spoolName ${spoolName}`)
      }
      const nextState = state
        .update('allTasks', tasks => tasks.set(task.id, task))
        .update(spoolName, spool => spool.push(task.id))
        .set('sendSpooledLineToPrinter', false)
      /*
       * recurse into the reducer to despool the first line if nothing is
       * spooled
       */
      if (nextState.currentTaskID == null) {
        const despooledState = spoolReducer(nextState, { type: 'DESPOOL' })
        return despooledState.set('sendSpooledLineToPrinter', true)
      }
      return nextState
    }
    case 'DESPOOL': {
      const { internalSpool, manualSpool, printQueue, currentTaskID } = state
      let nextState = state
      if (currentTaskID != null) {
        const task = state.allTasks.get(currentTaskID)
        if (task.currentLineNumber < task.data.size - 1) {
          return state.updateIn(
            ['allTasks', currentTaskID, 'currentLineNumber'],
            i => i + 1
          )
        }
        // Delete internal spool tasks after they are completed
        if (task.spoolName === 'internalSpool') {
          nextState = nextState
            .update('allTasks', tasks => tasks.delete(currentTaskID))
        // List all other task IDs in the history so that graphql users can
        // verify that their task completed. Tasks are deleted from the history
        // in FIFO fashion to prevent the list growing indefinitely. Also the
        // data of each completed task is deleted to save space.
        } else {
          nextState = nextState
            .update('history', history => history.push(currentTaskID))
            .setIn(['allTasks', currentTaskID, 'data'], null)
          if(state.history.size > maxTaskHistoryLength - 1) {
            const oldestTaskID = state.history.first()
            nextState = nextState
              .update('history', history => history.shift())
              .update('allTasks', tasks => tasks.delete(oldestTaskID))
          }
        }
      }
      const spoolName = (() => {
        if (printQueue.size > 0) {
          return 'printQueue'
        } else if (internalSpool.size > 0) {
          return 'internalSpool'
        } else if (manualSpool.size > 0) {
          return 'manualSpool'
        }
      })()
      if (spoolName == null) {
        return nextState.set('currentTaskID', null)
      }
      const nextTaskID = state[spoolName].first()
      return nextState
        .set('currentTaskID', nextTaskID)
        .setIn(
          ['allTasks', nextTaskID, 'currentLineNumber'],
          0
        )
        .update(spoolName, spool => spool.shift())
    }
    default:
      return state
  }
}

export default spoolReducer
