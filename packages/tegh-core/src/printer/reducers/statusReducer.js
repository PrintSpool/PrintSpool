import { Record } from 'immutable'

import { SPOOL_TASK } from '../../spool/actions/spoolTask'
import { ESTOP } from '../actions/estop'
import { DRIVER_ERROR } from '../actions/driverError'
import { PRINTER_READY } from '../actions/printerReady'

import { EMERGENCY } from '../../spool/types/PriorityEnum'

import { PRINTER_CONNECTING } from '../actions/printerConnecting'
import { PRINTER_DISCONNECTED } from '../actions/printerDisconnected'

import {
  ERRORED,
  ESTOPPED,
  DISCONNECTED,
  CONNECTING,
  READY,
} from '../types/statusEnum'

const initialState = Record({
  status: DISCONNECTED,
  error: null,
})()

const statusReducer = (state = initialState, action) => {
  switch (action.type) {
    case DRIVER_ERROR: {
      return initialState
        .set('status', ERRORED)
        .set('error', action.payload)
    }
    case ESTOP: {
      return initialState.set('status', ESTOPPED)
    }
    case PRINTER_DISCONNECTED: {
      return initialState.set('status', DISCONNECTED)
    }
    case PRINTER_CONNECTING: {
      return initialState.set('status', CONNECTING)
    }
    case PRINTER_READY: {
      return initialState.set('status', READY)
    }
    case SPOOL_TASK: {
      if (
        state.status !== READY
        && action.payload.task.priority !== EMERGENCY
      ) {
        const err = (
          'Only emergency tasks can be spooled when the machine is not ready.'
        )
        throw new Error(err)
      }
      return state
    }
    default: {
      return state
    }
  }
}

export default statusReducer
