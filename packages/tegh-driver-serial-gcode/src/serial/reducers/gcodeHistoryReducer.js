import { Record, List } from 'immutable'

import { SERIAL_SEND } from '../actions/serialSend'
import { SERIAL_RECEIVE } from '../actions/serialReceive'

export const initialState = Record({
  isPollingRequest: false,
  entries: List(),
  maxSize: 400,
  nextID: 0,
})()

const addEntry = ({
  state,
  direction,
  message,
  action,
}) => {
  const { maxSize, nextID, isPollingRequest } = state

  const nextState = state
    .set('nextID', nextID + 1)

  return nextState.update('entries', (entries) => {
    const { createdAt } = action.payload

    let nextEntries = entries.push({
      id: nextID,
      createdAt: new Date(createdAt).toUTCString(),
      direction,
      message,
      isPollingRequest,
    })

    if (nextEntries.size > maxSize) {
      nextEntries = nextEntries.shift()
    }

    return nextEntries
  })
}

const gcodeHistoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case SERIAL_SEND: {
      const { isPollingRequest, gcode } = action.payload

      const nextState = state.merge({
        isPollingRequest,
      })

      return addEntry({
        state: nextState,
        action,
        direction: 'TX',
        message: gcode,
      })
    }
    case SERIAL_RECEIVE: {
      let nextState = addEntry({
        state,
        action,
        direction: 'RX',
        message: action.payload.raw,
      })

      if (action.payload.type === 'ok') {
        nextState = nextState.merge({
          isPollingRequest: false,
        })
      }

      return nextState
    }
    default: {
      return state
    }
  }
}

export default gcodeHistoryReducer
