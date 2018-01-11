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
  currentTaskID: null,
  sendSpooledLineToPrinter: false,
})

const initialState: SpoolState = new createSpoolState()

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
      const task = state.allTasks[currentTaskID]
      if (
        currentTaskID != null &&
        task.currentLineNumber < task.data.size - 1
      ) {
        return state.updateIn(
          ['allTasks', currentTaskID, 'currentLineNumber'],
          i => i + 1
        )
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
        return state.set('currentTaskID', null)
      }
      const nextTaskID = state[spoolName].first()
      // TODO: prevent allTasks from growing indefinitely. Delete oldest tasks
      return state
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
