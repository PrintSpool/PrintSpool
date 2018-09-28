import { loop, Cmd } from 'redux-loop'
import {
  Record, List, Map,
} from 'immutable'

import isIdle from '../selectors/isIdle'

import {
  EMERGENCY,
  NORMAL,
  PREEMPTIVE,
  priorityOrder,
} from '../types/PriorityEnum'

import {
  PRINTING,
  isSpooled,
} from '../types/TaskStatusEnum'

/* printer actions */
import { PRINTER_READY } from '../../printer/actions/printerReady'
import { ESTOP } from '../../printer/actions/estop'
import { DRIVER_ERROR } from '../../printer/actions/driverError'
/* job actions */
import { CANCEL_JOB } from '../../jobQueue/actions/cancelJob'
import { DELETE_JOB } from '../../jobQueue/actions/deleteJob'
/* task actions */
import { SPOOL_TASK } from '../actions/spoolTask'
import requestDespool, { REQUEST_DESPOOL } from '../actions/requestDespool'
import despoolTask from '../actions/despoolTask'
import { CANCEL_TASK } from '../actions/cancelTask'
import cancelAllTasks, { CANCEL_ALL_TASKS } from '../actions/cancelAllTasks'

export const initialState = Record({
  priorityQueues: Record({
    [EMERGENCY]: List(),
    [PREEMPTIVE]: List(),
    [NORMAL]: List(),
  })(),
  tasks: Map(),
  currentTaskID: null,
})()

const removeTaskReferences = (state) => {
  const nextTaskIDs = state.tasks.map(task => task.id)

  let nextState = state
    .update('priorityQueues', queues => queues.map(queue => (
      queue.filter(taskID => nextTaskIDs.includes(taskID))
    )))

  if (nextTaskIDs.includes(state.currentTaskID) === false) {
    nextState = nextState.set('currentTaskID', null)
  }

  return nextState
}

const spoolReducer = () => (state = initialState, action) => {
  switch (action.type) {
    /* Spool reset actions */
    case PRINTER_READY:
    case ESTOP:
    case DRIVER_ERROR:
    case CANCEL_ALL_TASKS: {
      return initialState
    }
    case CANCEL_JOB:
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
      const { payload } = action
      const { id, priority } = payload.task

      let nextState = state

      /*
      * if the task is an emergency then cancel all other tasks in the queue
      */
      if (priority === EMERGENCY) {
        nextState = initialState
      }

      nextState = state.setIn(['tasks', id], payload.task)

      if (
        isIdle.resultFunc(state.tasks) === false
        && priority !== EMERGENCY
        && payload.task.internal !== true
      ) {
        throw new Error('Cannot spool non-emergency tasks when printing a job')
      }


      /* create the task */
      const createAction = createTask({ task: payload.task })
      nextState = taskMap.createOne(nextState, createAction)

      const taskQueue = ['priorityQueues', priority]
      const shouldDespool = nextState.currentTaskID == null

      nextState = nextState
        .updateIn(taskQueue, list => list.push(id))

      /*
       * despool the first line if nothing is spooled
       */
      if (shouldDespool) {
        return loop(nextState, Cmd.action(requestDespool()))
      }

      return nextState
    }
    case REQUEST_DESPOOL: {
      const { priorityQueues, currentTaskID } = state
      let nextState = state
      if (currentTaskID != null) {
        /*
         * despool the next line or finish the task via the taskReducer
         */
        nextState = taskMap.updateOne(nextState, action, currentTaskID)
      }
      const currentTask = nextState.tasks.get(currentTaskID)
      if (currentTask == null || currentTask.status !== PRINTING) {
        /*
         * if the current task is done then despool the next task if there is
         * anything to despool.
         */
        const priority = priorityOrder.find(priorityOption => (
          priorityQueues[priorityOption].size > 0
        ))

        if (priority == null) {
          nextState = nextState.set('currentTaskID', null)
        } else {
          const nextTaskID = state.priorityQueues[priority].first()
          /*
           * start the task via the taskReducer
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
      }

      if (nextState.currentTaskID == null) {
        return nextState
      }

      const nextTask = nextState.tasks.get(nextState.currentTaskID)
      return loop(nextState, Cmd.action(despoolTask(nextTask)))
    }
    case REQUEST_DESPOOL: {
      if (state.currentLineNumber < state.data.size - 1) {
        /*
         * if the task has more lines to execute then increment the line number
         */
        return state.update('currentLineNumber', i => i + 1)
      }
      /* mark tasks as done after they are completed */
      return state.merge({
        // TODO: stoppedAt should eventually be changed to be sent after
        // the printer sends 'ok' or 'error' and should be based off
        // estimated print time
        stoppedAt: new Date().toISOString(),
        status: DONE,
        /* the data of each completed task is deleted to save space */
        data: null,
      })
    }
    default: {
      return state
    }
  }
}

export default spoolReducer
