import {
  DRIVER_ERROR,
} from 'tegh-server'

import { SERIAL_OPEN } from '../../serial/actions/serialOpen'
import { SERIAL_OPEN_ERROR } from '../../serial/actions/serialOpenError'
import { SERIAL_CLOSE } from '../../serial/actions/serialClose'
import { SERIAL_SEND } from '../../serial/actions/serialSend'
import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import { SERIAL_ERROR } from '../../serial/actions/serialError'
import { SERIAL_RESET } from '../../serial/actions/serialReset'

const rxLevel = (type) => {
  switch (type) {
    case 'error':
      return 'error'
    case 'parser_error':
    case 'warning':
      return 'warning'
    default:
      return 'info'
  }
}

const logReducer = (_state, action) => {
  switch (action.type) {
    case SERIAL_RECEIVE: {
      const { raw, type } = action.payload

      const message = (() => {
        if (type === 'parser_error') {
          return `parser error on line: ${JSON.stringify(raw)}`
        }
        if (type === 'warning' || type === 'error') {
          return action.payload.message
        }
        return raw
      })()

      return {
        source: 'RX',
        level: rxLevel(type),
        message,
      }
    }
    case SERIAL_SEND: {
      return {
        source: 'TX',
        level: 'info',
        message: action.payload.line.replace('\n', ''),
      }
    }
    case SERIAL_RESET: {
      return {
        source: 'SERIAL',
        level: 'info',
        message: 'Serial Reset',
      }
    }
    case SERIAL_CLOSE: {
      return {
        source: 'SERIAL',
        level: 'info',
        message: 'Serial Disconnected',
      }
    }
    case SERIAL_OPEN: {
      return {
        source: 'SERIAL',
        level: 'info',
        message: 'Serial Connected',
      }
    }
    case SERIAL_OPEN_ERROR: {
      return {
        source: 'SERIAL',
        level: 'warning',
        message: (
          'Unable to open serial port\n'
          + `${action.payload.message}\n${action.payload.stack}`
        ),
      }
    }
    case SERIAL_ERROR: {
      return {
        source: 'SERIAL',
        level: 'error',
        message: (
          'Serial Error: '
          + `${action.payload.message}\n${action.payload.stack}`
        ),
      }
    }
    case DRIVER_ERROR: {
      return {
        source: (
          action.payload.code === 'FIRMWARE_ERROR' ? 'FIRMWARE' : 'DRIVER'
        ),
        level: 'error',
        message: action.payload.message,
      }
    }
    default: {
      return {
        source: 'ACTION',
        level: 'trivial',
        message: JSON.stringify(action),
      }
    }
  }
}

export default logReducer
