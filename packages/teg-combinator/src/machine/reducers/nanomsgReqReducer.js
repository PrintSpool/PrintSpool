import { Record, Map, List } from 'immutable'
import { loop, Cmd } from 'redux-loop'

import {
  SET_CONFIG,
  CANCEL_TASK,
} from 'teg-core'

import connectToMachine from '../sideEffects/connectToMachine'
import sendActionToMachine from '../sideEffects/sendActionToMachine'

export const initialState = Record({
  machineConnections: Map(),
})()

const jobQueueReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload

      // TODO use json patch to determin how to close / open connections based on changes
      return nextState
    }
    case CANCEL_TASK: {
      const { machineID } = action.payload
      const machineConnection = state.machineConnections.get(machineID)

      return loop(
        state,
        Cmd.run(sendActionToMachine, {
          args: [{
            action,
            machineConnection,
          }],
        }),
      )
    }
    case SEND_TASK_TO_MACHINE: {
      const { task } = action.payload

      const machine = state.machines.find(() => (
        // TODO: find appropriate machines for the task
        true
      ))

      return loop(
        state,
        Cmd.run(sendActionToMachine, {
          args: [{
            action: spoolTask({ task }),
            machine,
          }],
        }),
      )
    }
    default: {
      return state
    }
  }
}

export default jobQueueReducer
