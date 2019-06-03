import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

// TODO: implement task errored in spoolReducer
import { PRINTER_READY } from '../../printer/actions/printerReady'
import { ESTOP } from '../../printer/actions/estop'
import { DRIVER_ERROR } from '../../printer/actions/driverError'

import { TASK_ERRORED } from '../actions/taskErrored'
import { DESPOOL_TASK } from '../actions/despoolTask'
import { DESPOOL_COMPLETED } from '../actions/despoolCompleted'

export const initialState = Record({
  completingTask: null,
})()

const spoolReducer = (state = initialState, action) => {
  switch (action.type) {
    case PRINTER_READY:
    case ESTOP:
    case DRIVER_ERROR: {
      return initialState
    }
    case TASK_ERRORED: {
      const { task } = action.payload

      let nextState = state

      if (task.id === state.completingTask.id) {
        nextState = initialState
      }

      if (task.onError) {
        return loop(
          nextState,
          Cmd.run(task.onError, {
            args: [task],
          }),
        )
      }

      return nextState
    }
    case DESPOOL_TASK: {
      const { isLastLineInTask, task } = action.payload

      if (isLastLineInTask) {
        return state.set('completingTask', task)
      }

      return state
    }
    case DESPOOL_COMPLETED: {
      const { completingTask } = state

      if (completingTask && completingTask.onComplete) {
        return loop(
          initialState,
          Cmd.run(completingTask.onComplete, {
            args: [completingTask],
          }),
        )
      }

      return initialState
    }
    default: {
      return state
    }
  }
}

export default spoolReducer
