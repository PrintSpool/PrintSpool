import { Record, List } from 'immutable'

import {
  DESPOOL_TASK,
} from '@tegh/core'

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

  const {
    createdAt,
    isHostMacro = false,
  } = action.payload

  const entry = {
    id: nextID,
    createdAt,
    isHostMacro,
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
    case DESPOOL_TASK: {
      const { macro, args, task } = action.payload
      const { isPollingRequest } = task

      const argsString = JSON.stringify(args, null, 1).replace(/\n +/g, ' ')

      const nextState = state.merge({
        isPollingRequest,
      })

      return addEntry({
        state: nextState,
        action,
        direction: 'TX',
        message: `${macro} ${argsString}`,
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
