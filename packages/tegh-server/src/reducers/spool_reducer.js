// @flow
import { merge, Record, List, Map } from 'immutable'

import type {
  SpoolAction,
  DespoolAction,
  Task,
  SpoolState
} from './spool_reducer_types'

const priorityOrder = List([
  'emergency',
  'preemptive',
  'normal',
])

const createQueuedTaskIDs = Record({
  emergency: List(),
  preemptive: List(),
  normal: List(),
})

const createSpoolState = Record({
  queuedTaskIDs: createQueuedTaskIDs(),
  allTasks: Map(),
  history: List(),
  currentTaskID: null,
  sendSpooledLineToPrinter: false,
})

const initialState: SpoolState = new createSpoolState()
const maxTaskHistoryLength = 3

const addToHistory = (state, collection) => {
  let nextHistory = state.history.merge(collection)
  const overflowSize = nextHistory.size - maxTaskHistoryLength
  let nextState = state
  if (overflowSize > 0) {
    const overflow = nextHistory.slice(0, overflowSize)
    nextHistory = nextHistory.slice(overflowSize + 1)
    nextState = nextState.update('allTasks', tasks =>
      tasks.filterNot(task => overflow.includes(task))
    )
  }
  // TODO: delete contents of the tasks in the history
  return nextState.set('history', nextHistory)
}

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
    /* Spool reset actions */
    case 'PRINTER_READY':
    case 'ESTOP':
    case 'DRIVER_ERROR': {
      const { currentTaskID } = state
      let removedTasks = List().concat(
        Object.values(state.queuedTaskIDs.toObject())
      )
      if (currentTaskID != null) {
        removedTasks = removedTasks.concat([currentTaskID])
      }
      const nextState = addToHistory(state, removedTasks)
        .set('queuedTaskIDs', createQueuedTaskIDs())
      if (currentTaskID == null) return nextState
      const status = action.type === 'DRIVER_ERROR' ? 'errored' : 'cancelled'
      return nextState
        .setIn(['allTasks', currentTaskID, 'status'], status)
        .set('currentTaskID', null)
    }
    case 'SPOOL': {
      const { task } = action
      const { priority } = task
      if (!priorityOrder.includes(priority)) {
        throw new Error(`Invalid priority ${priority}`)
      }
      let nextState = state
        .update('allTasks', tasks => tasks.set(task.id, task))
        .updateIn(['queuedTaskIDs', priority], list => list.push(task.id))
        .set('sendSpooledLineToPrinter', false)
      /*
       * Emergency tasks cancel and pre-empt the current task
       */
      if (priority === 'emergency' && state.currentTaskID != null) {
         nextState = nextState
          .setIn(['allTasks', state.currentTaskID, 'status'], 'cancelled')
          .set('currentTaskID', null)
      }
      /*
       * recurse into the reducer to despool the first line if nothing is
       * spooled
       */
      if (nextState.currentTaskID == null) {
        return spoolReducer(nextState, { type: 'DESPOOL' })
          .set('sendSpooledLineToPrinter', true)
      }
      return nextState
    }
    case 'DESPOOL': {
      const { queuedTaskIDs, currentTaskID } = state
      let nextState = state
      if (currentTaskID != null) {
        const task = state.allTasks.get(currentTaskID)
        if (task.currentLineNumber < task.data.size - 1) {
          return state.updateIn(
            ['allTasks', currentTaskID, 'currentLineNumber'],
            i => i + 1
          )
        }
        // Delete internal tasks after they are completed
        if (task.internal) {
          nextState = nextState
            .update('allTasks', tasks => tasks.delete(currentTaskID))
        // List all other task IDs in the history so that graphql users can
        // verify that their task completed. Tasks are deleted from the history
        // in FIFO fashion to prevent the list growing indefinitely. Also the
        // data of each completed task is deleted to save space.
        } else {
          const taskUpdates = {
            // TODO: stoppedAt should eventually be changed to be sent after
            // the printer sends 'ok' or 'error' and should be based off
            // estimated print time
            stoppedAt: new Date().toISOString(),
            status: 'done',
            data: null,
          }
          nextState = addToHistory(nextState, [currentTaskID])
            .mergeIn(['allTasks', currentTaskID], taskUpdates)
        }
      }
      const priority = priorityOrder.find(priority =>
        queuedTaskIDs[priority].size > 0
      )
      if (priority == null) {
        return nextState.set('currentTaskID', null)
      }
      const nextTaskID = state.queuedTaskIDs[priority].first()
      return nextState
        .set('currentTaskID', nextTaskID)
        .mergeIn(['allTasks', nextTaskID], {
          startedAt: new Date().toISOString(),
          currentLineNumber: 0,
        })
        .updateIn(['queuedTaskIDs', priority], list => list.shift())
    }
    default:
      return state
  }
}

export default spoolReducer
