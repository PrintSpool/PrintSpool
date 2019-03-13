import { loop, Cmd } from 'redux-loop'
import {
  Record, List, Map,
} from 'immutable'

import isIdle from '../selectors/isIdle'
import getEnabledHostMacros from '../../pluginManager/selectors/getEnabledHostMacros'

import {
  EMERGENCY,
  NORMAL,
  PREEMPTIVE,
  priorityOrder,
} from '../types/PriorityEnum'

import {
  PRINTING,
} from '../types/TaskStatusEnum'

/* config actions */
import { SET_CONFIG } from '../../config/actions/setConfig'
/* printer actions */
import { PRINTER_READY } from '../../printer/actions/printerReady'
import { ESTOP } from '../../printer/actions/estop'
import { DRIVER_ERROR } from '../../printer/actions/driverError'
/* job actions */
import { DELETE_JOB } from '../../jobQueue/actions/deleteJob'
/* task actions */
import { SPOOL_TASK } from '../actions/spoolTask'
import requestDespool, { REQUEST_DESPOOL } from '../actions/requestDespool'
import { DESPOOL_COMPLETED } from '../actions/despoolCompleted'
import despoolTask from '../actions/despoolTask'
import { CANCEL_TASK } from '../actions/cancelTask'

export const initialState = Record({
  priorityQueues: Record({
    [EMERGENCY]: List(),
    [PREEMPTIVE]: List(),
    [NORMAL]: List(),
  })(),
  tasks: Map(),
  currentTaskID: null,
  enabledHostMacros: List(),
  despoolRequested: false,
  despooling: false,
})()

const removeTaskReferences = (state) => {
  const nextTaskIDs = state.tasks.map(task => task.id)

  let nextState = state
  priorityOrder.forEach((priority) => {
    nextState = nextState.updateIn(['priorityQueues', priority], queue => (
      queue.filter(taskID => nextTaskIDs.includes(taskID))
    ))
  })

  if (nextTaskIDs.includes(state.currentTaskID) === false) {
    nextState = nextState.set('currentTaskID', null)
  }

  return nextState
}

const spoolReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      return initialState
        .set('enabledHostMacros', getEnabledHostMacros(action.payload))
    }
    /* Spool reset actions */
    case PRINTER_READY:
    case ESTOP:
    case DRIVER_ERROR: {
      return initialState
        .set('enabledHostMacros', state.enabledHostMacros)
    }
    case DELETE_JOB: {
      const { jobID } = action.payload

      const nextState = state.update('tasks', tasks => (
        tasks.filter(task => task.jobID !== jobID)
      ))

      return removeTaskReferences(nextState)
    }
    case CANCEL_TASK: {
      const { taskID } = action.payload

      const nextState = state.update('tasks', tasks => tasks.remove(taskID))

      return removeTaskReferences(nextState)
    }
    case SPOOL_TASK: {
      const { task, prepend } = action.payload
      const { id, priority } = task

      let nextState = state

      /*
      * if the task is an emergency then cancel all other tasks in the queue
      */
      if (priority === EMERGENCY) {
        nextState = initialState
          .set('enabledHostMacros', state.enabledHostMacros)
      }

      if (isIdle(nextState) === false && task.internal !== true) {
        throw new Error('Cannot spool non-emergency tasks when printing a job')
      }

      /* add the task to the spool */
      nextState = nextState
        .setIn(['tasks', id], task)
        .updateIn(['priorityQueues', priority], (list) => {
          if (prepend) {
            return list.unshift(id)
          }
          return list.push(id)
        })

      /*
       * despool the first line if nothing is spooled
       */
      const shouldDespool = (
        nextState.currentTaskID == null
        && state.despooling === false
        && state.despoolRequested === false
      )
      if (shouldDespool) {
        nextState = nextState.set('despoolRequested', true)
        return loop(nextState, Cmd.action(requestDespool()))
      }

      return nextState
    }
    case REQUEST_DESPOOL: {
      const { priorityQueues, currentTaskID, despooling } = state

      let nextState = state.set('despooling', true)

      const currentTask = nextState.tasks.get(currentTaskID)

      if (despooling) {
        throw new Error('Cannot request despool while already despooling')
      }

      if (currentTask != null) {
        /*
         * despool the next line or finish the task
         */
        if (currentTask.currentLineNumber < currentTask.data.size - 1) {
          /*
           * if the task has more lines to execute then increment the line number
           */
          nextState = nextState
            .updateIn(['tasks', currentTaskID, 'currentLineNumber'], i => i + 1)
        } else {
          /* delete the task upon completion */
          nextState = nextState
            .set('currentTaskID', null)
            .update('tasks', tasks => tasks.remove(currentTaskID))
        }
      }

      if (nextState.currentTaskID == null) {
        /*
         * if the current task is done then despool the next task if there is
         * anything to despool.
         */
        const priority = priorityOrder.find(priorityOption => (
          priorityQueues[priorityOption].size > 0
        ))

        const allQueuesAreEmpty = priority == null
        if (allQueuesAreEmpty) {
          return initialState
            .set('enabledHostMacros', state.enabledHostMacros)
        }

        const nextTaskID = state.priorityQueues[priority].first()

        /*
         * start the task
         */
        nextState = nextState
          .mergeIn(['tasks', nextTaskID], {
            startedAt: new Date().toISOString(),
            status: PRINTING,
            currentLineNumber: 0,
          })
          .set('currentTaskID', nextTaskID)
          .updateIn(['priorityQueues', priority], list => list.shift())
      }

      const nextTask = nextState.tasks.get(nextState.currentTaskID)
      return loop(
        nextState,
        Cmd.action(despoolTask(nextTask, state.enabledHostMacros)),
      )
    }
    case DESPOOL_COMPLETED: {
      const nextState = state
        .set('despooling', false)
        .set('despoolRequested', true)
      return loop(nextState, Cmd.action(requestDespool()))
    }
    default: {
      return state
    }
  }
}

export default spoolReducer
