import { Record } from 'immutable'

import { CONNECT_PRINTER } from '../actions/connectPrinter'
import { PRINTER_READY } from '../actions/printerReady'
import { DRIVER_ERROR } from '../actions/driverError'
import { ESTOP } from '../actions/estop'
import { PRINTER_DISCONNECTED } from '../actions/printerDisconnected'

import { SPOOL_TASK } from '../../spool/actions/spoolTask'

import { EMERGENCY } from '../../spool/types/PriorityEnum'

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
    case CONNECT_PRINTER: {
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
