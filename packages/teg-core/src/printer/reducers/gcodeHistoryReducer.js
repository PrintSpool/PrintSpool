import { Record, List, Map } from 'immutable'

import { SET_CONFIG } from '../../config/actions/setConfig'
import { SOCKET_MESSAGE } from '../actions/socketMessage'

export const TX = 'TX'
export const RX = 'RX'

const directionsIndex = [
  RX,
  TX,
]

const MachineHistory = Record({
  historyEntries: List(),
  maxSize: 400,
})

export const initialState = Map()

let nextID = 0

const HistoryEntry = (entry) => {
  // eslint-disable-next-line no-param-reassign
  entry.id = nextID
  nextID += 1
  return entry
}

const gcodeHistoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload

      return config.machines.map(() => MachineHistory())
    }
    case SOCKET_MESSAGE: {
      const {
        machineID,
        message,
      } = action.payload

      const { gcodeHistory = [] } = message.feedback || {}

      if (state.get(machineID) == null) {
        throw new Error(`Unexpected machineID: ${machineID}`)
      }

      const { maxSize } = state.get(machineID)

      const createdAt = new Date().toISOString()

      const newEntries = gcodeHistory.map(({ content, direction }) => (
        HistoryEntry({
          content,
          direction: directionsIndex[direction],
          createdAt,
        })
      ))

      return state
        .updateIn([machineID, 'historyEntries'], (entries) => {
          let nextEntries = entries.concat(newEntries)

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
