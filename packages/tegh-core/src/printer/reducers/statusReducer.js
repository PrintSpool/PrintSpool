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

export const initialState = Record({
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
      if (state.status === DISCONNECTED) {
        throw new Error('Cannot disconnect a printer if it is not connected')
      }
      return initialState.set('status', DISCONNECTED)
    }
    case CONNECT_PRINTER: {
      if (state.status === CONNECTING || state.status === READY) {
        throw new Error(`Cannot connect printer when status = ${state.status}`)
      }
      return initialState.set('status', CONNECTING)
    }
    case PRINTER_READY: {
      if (state.status !== CONNECTING) {
        throw new Error('Cannot set status to READY without connecting first')
      }
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
