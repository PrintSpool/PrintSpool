import { loop, Cmd } from 'redux-loop'
import { Record, List } from 'immutable'

// TODO: implement task errored in spoolReducer
import { PRINTER_READY } from '../../printer/actions/printerReady'
import { ESTOP } from '../../printer/actions/estop'
import { DRIVER_ERROR } from '../../printer/actions/driverError'

import { TASK_ERRORED } from '../actions/taskErrored'
import { DESPOOL_TASK } from '../actions/despoolTask'
import { DESPOOL_COMPLETED } from '../actions/despoolCompleted'

export const initialState = List()

const spoolReducer = (state = initialState, action) => {
  switch (action.type) {
    case PRINTER_READY:
    case ESTOP:
    case DRIVER_ERROR: {
      return initialState
    }
    case TASK_ERRORED: {
      const { task } = action.payload

      if (task.onError) {
        return loop(
          state,
          Cmd.run(task.onError, {
            args: [task],
          }),
        )
      }

      return state
    }
    case DESPOOL_COMPLETED: {
      const { task, isLastLineInTask } = action.payload

      const nextState = state.shift()

      if (isLastLineInTask && task.onComplete) {
        return loop(
          nextState,
          Cmd.run(task.onComplete, {
            args: [task],
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
