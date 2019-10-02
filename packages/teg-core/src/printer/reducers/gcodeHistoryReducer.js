import { Record, List, Map } from 'immutable'

import { SET_CONFIG } from '../../config/actions/setConfig'
import { LINE_NUMBER_CHANGE } from '../../jobQueue/actions/lineNumberChange'

const MachineHistory = Record({
  historyEntries: List(),
  maxSize: 400,
})

export const initialState = Map()

let nextID = 0

const gcodeHistoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload

      console.log('start history')
      return config.machines.map(() => MachineHistory())
    }
    case SOCKET_MESSAGE: {
      const { machineID } = action.payload
      const { feedback = {} } = action.payload.message
      const { responses = [] } = feedback
      // TODO: coalate responses into the history
    }
    case LINE_NUMBER_CHANGE: {
      const { task } = action.payload
      const { machineID } = task
      const { maxSize } = state.get(machineID)

      const sliceStart = (
        task.previousLineNumber == null ? 0 : task.previousLineNumber + 1
      )

      const addedCommands = task.commands.slice(
        sliceStart,
        task.currentLineNumber + 1,
      )

      const createdAt = new Date().toISOString()

      // eslint-disable-next-line no-return-assign
      const addedEntries = addedCommands.map(command => ({
        id: (nextID += 1),
        command,
        createdAt,
      }))
      console.log('HISTORY:', addedCommands)

      return state
        .updateIn([machineID, 'historyEntries'], (entries) => {
          let nextEntries = entries.concat(addedEntries)

          if (nextEntries.size > maxSize) {
            nextEntries = nextEntries.slice(-maxSize)
          }

          return nextEntries
        })
    }
    default: {
      return state
    }
  }
}

export default gcodeHistoryReducer
