import { Record, List } from 'immutable'

import { SERIAL_SEND } from '../actions/serialSend'
import { SERIAL_RECEIVE } from '../actions/serialReceive'

export const initialState = Record({
  isPollingRequest: false,
  fullHistory: List(),
  historyExcludingPolling: List(),
  maxSize: 400,
  nextID: 0,
})()

const addEntryToList = (entry, maxSize) => (list) => {
  let nextList = list.push(entry)

  if (nextList.size > maxSize) {
    nextList = nextList.shift()
  }

  return nextList
}

const addEntry = ({
  state,
  direction,
  message,
  action,
}) => {
  const { maxSize, nextID, isPollingRequest } = state

  const { createdAt } = action.payload

  const entry = {
    id: nextID,
    createdAt: new Date(createdAt).toUTCString(),
    direction,
    message,
    isPollingRequest,
  }

  let nextState = state
    .set('nextID', nextID + 1)
    .update('fullHistory', addEntryToList(entry, maxSize))

  if (!isPollingRequest) {
    nextState = nextState
      .update('historyExcludingPolling', addEntryToList(entry, maxSize))
  }

  return nextState
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
