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

import serialPortCreated, { SERIAL_PORT_CREATED } from '../actions/serialPortCreated'
import { SERIAL_SEND } from '../actions/serialSend'
import { SERIAL_CLOSE } from '../actions/serialClose'

import serialPortConnection from '../sideEffects/serialPortConnection'
import closeSerialPort from '../sideEffects/closeSerialPort'
import resetSerialPort from '../sideEffects/resetSerialPort'
import writeToSerialPort from '../sideEffects/writeToSerialPort'

export const initialState = Record({
  serialPort: null,
})()

/*
 * controls a serial port through side effects
 */
const serialReducer = (state = initialState, action) => {
  switch (action.type) {
    case CONNECT_PRINTER: {
      const {
        portID,
        baudRate,
        simulation,
      } = getDriverConfig(action.config).serial

      if (state.serialPort == null) {
        const serialPortOpts = {
          portID,
          baudRate,
          receiveParser: rxParser,
          simulator: simulation ? simulator : null,
        }

        return loop(
          state,
          Cmd.run(serialPortConnection, {
            args: [serialPortOpts],
            successActionCreator: serialPortCreated,
          }),
        )
      }

      return loop(
        state,
        Cmd.run(resetSerialPort, {
          args: [state],
        }),
      )
    }
    case SERIAL_PORT_CREATED: {
      return state.set('serialPort', action.payload.serialPort)
    }
    case SERIAL_CLOSE: {
      return loop(
        initialState,
        Cmd.action(printerDisconnected()),
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
          args: [state],
        }),
      )
    }
    default: {
      return state
    }
  }
}

export default serialReducer
