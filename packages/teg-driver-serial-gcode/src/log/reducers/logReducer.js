import {
  DRIVER_ERROR,
  PRINTER_DISCONNECTED,
} from '@tegapp/core'

import { SERIAL_OPEN } from '../../serial/actions/serialOpen'
import { SERIAL_SEND } from '../../serial/actions/serialSend'
import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import { SERIAL_ERROR } from '../../serial/actions/serialError'

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
        // source: action.payload.type === 'feedback' ? 'RX(FEEDBACK)' : 'RX',
        source: 'RX',
        level: rxLevel(type),
        message,
      }
    }
    case SERIAL_SEND: {
      // let source = 'TX'
      // if (action.payload.macro === 'M105') {
      //   source = 'TX(TEMPERATURE)'
      // }
      // if (action.payload.macro === 'M114') {
      //   source = 'TX(POSITION)'
      // }
      return {
        source: 'TX',
        level: 'info',
        message: action.payload.line.replace('\n', ''),
      }
    }
    case SERIAL_OPEN:
    case PRINTER_DISCONNECTED: {
      return {
        source: 'SERIAL',
        level: 'info',
        message: action.type,
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
      const { message, code } = action.payload
      return {
        source: (
          code === 'FIRMWARE_ERROR' ? 'FIRMWARE' : 'DRIVER'
        ),
        level: 'error',
        message: `${code}: ${message}`,
      }
    }
    default: {
      return null
    }
  }
}

export default logReducer
