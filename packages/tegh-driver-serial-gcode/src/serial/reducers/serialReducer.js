import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  CONNECT_PRINTER,
  DRIVER_ERROR,
  ESTOP,
  printerDisconnected,
  getDriverConfig,
} from 'tegh-core'

import rxParser from '../../rxParser'
import simulator from '../simulator'

import requestSerialPortReconnection, { REQUEST_SERIAL_PORT_RECONNECTION } from '../actions/requestSerialPortReconnection'
import serialPortCreated, { SERIAL_PORT_CREATED } from '../actions/serialPortCreated'
import { SERIAL_SEND } from '../actions/serialSend'
import { SERIAL_CLOSE } from '../actions/serialClose'

import serialPortConnection from '../sideEffects/serialPortConnection'
import closeSerialPort from '../sideEffects/closeSerialPort'
import writeToSerialPort from '../sideEffects/writeToSerialPort'

export const initialState = Record({
  serialPort: null,
  isResetting: false,
})()

/*
 * controls a serial port through side effects
 */
const serialReducer = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_SERIAL_PORT_RECONNECTION:
    case CONNECT_PRINTER: {
      if (state.serialPort == null) {
        const {
          portID,
          baudRate,
          simulation,
        } = getDriverConfig(action.config).serial

        const serialPortOptions = {
          portID,
          baudRate,
          receiveParser: rxParser,
          simulator: simulation ? simulator : null,
        }

        return loop(
          initialState,
          Cmd.run(serialPortConnection, {
            args: [serialPortOptions],
            successActionCreator: serialPortCreated,
          }),
        )
      }

      const nextState = initialState.set('isResetting', true)

      return loop(
        nextState,
        Cmd.run(closeSerialPort, {
          args: [{
            serialPort: state.serialPort,
          }],
        }),
      )
    }
    case SERIAL_PORT_CREATED: {
      return state
        .set('serialPort', action.payload.serialPort)
    }
    case SERIAL_CLOSE: {
      const nextAction = (() => {
        if (state.isResetting) return requestSerialPortReconnection()
        return printerDisconnected()
      })()

      return loop(
        initialState,
        Cmd.action(nextAction),
      )
    }
    case SERIAL_SEND: {
      return loop(
        state,
        Cmd.run(writeToSerialPort, {
          args: [{
            serialPort: state.serialPort,
            line: action.payload.line,
          }],
        }),
      )
    }
    case DRIVER_ERROR:
    case ESTOP: {
      return loop(
        initialState,
        Cmd.run(closeSerialPort, {
          args: [{
            serialPort: state.serialPort,
          }],
        }),
      )
    }
    default: {
      return state
    }
  }
}

export default serialReducer
