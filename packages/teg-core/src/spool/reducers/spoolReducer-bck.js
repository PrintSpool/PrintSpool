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
import { REQUEST_SET_CONFIG } from '../../config/actions/requestSetConfig'
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
import { CANCEL_TASK } from '../actions/cancelTasks'
import taskErrored from '../actions/taskErrored'

export const initialState = Record({
  priorityQueues: Record({
    [EMERGENCY]: List(),
    [PREEMPTIVE]: List(),
    [NORMAL]: List(),
  })(),
  tasks: Map(),
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

  return nextState
}

const spoolReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      return initialState
        .set('enabledHostMacros', getEnabledHostMacros(action.payload))
    }
    case REQUEST_SET_CONFIG: {
      if (!isIdle(state)) {
        throw new Error('Cannot modify configurations while Printing')
      }

      return state
    }
    /* Spool reset actions */
    case PRINTER_READY:
    case ESTOP:
    case DRIVER_ERROR: {
      const nextState = initialState
        .set('enabledHostMacros', state.enabledHostMacros)

      return loop(
        nextState,
        Cmd.list(
          state.tasks.toArray().map(task => Cmd.action(taskErrored({ task }))),
        ),
      )
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
        state.despooling === false
        && state.despoolRequested === false
      )

      if (shouldDespool) {
        nextState = nextState.set('despoolRequested', true)
        return loop(nextState, Cmd.action(requestDespool()))
      }

      return nextState
    }
    case REQUEST_DESPOOL: {
      const { priorityQueues, despooling } = state

      if (despooling) {
        throw new Error('Cannot request despool while already despooling')
      }

      /*
       * find the current task. By looking this up each despool we allow
       * for tasks to preempt one another depending on priority.
       */
      const priority = priorityOrder.find(priorityOption => (
        priorityQueues[priorityOption].size > 0
      ))

      const allQueuesAreEmpty = priority == null
      if (allQueuesAreEmpty) {
        return initialState
          .set('enabledHostMacros', state.enabledHostMacros)
      }

      const taskID = state.priorityQueues[priority].first()
      let task = state.tasks.get(taskID)

      let nextState = state
        .set('despooling', true)

      if (task.status !== PRINTING) {
        /*
         * start the task
         */
        task = task.merge({
          startedAt: new Date().toISOString(),
          status: PRINTING,
          currentLineNumber: 0,
        })
      } else {
        /*
         * if the task is already printing then increment the line number
         */
        task = task.update('currentLineNumber', i => i + 1)
      }

      nextState = nextState.setIn(['tasks', taskID], task)

      return loop(
        nextState,
        Cmd.action(despoolTask(task, state.enabledHostMacros)),
      )
    }
    case DESPOOL_COMPLETED: {
      const { task, isLastLineInTask } = action.payload

      let nextState = state
        .set('despooling', false)
        .set('despoolRequested', true)

      if (isLastLineInTask) {
        /*
         * delete the task upon completion
         */
        nextState = nextState
          .update('tasks', tasks => tasks.remove(task.id))
          .updateIn(['priorityQueues', task.priority], list => (
            list.filter(id => id !== task.id)
          ))
      }

      return loop(nextState, Cmd.action(requestDespool()))
    }
    default: {
      return state
    }
  }
}

export default spoolReducer
