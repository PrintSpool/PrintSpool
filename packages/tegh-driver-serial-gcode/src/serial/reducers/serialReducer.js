import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  SET_CONFIG,
  CONNECT_PRINTER,
  DRIVER_ERROR,
  ESTOP,
  DEVICE_CONNECTED,
  connectPrinter,
  printerDisconnected,
  getDriverConfig,
} from 'tegh-core'

import rxParser from '../../rxParser'
import simulator from '../simulator'

import requestSerialPortConnection, { REQUEST_SERIAL_PORT_CONNECTION } from '../actions/requestSerialPortConnection'
import serialPortCreated, { SERIAL_PORT_CREATED } from '../actions/serialPortCreated'
import { SERIAL_SEND } from '../actions/serialSend'
import { SERIAL_CLOSE } from '../actions/serialClose'
import serialReset, { SERIAL_RESET } from '../actions/serialReset'

import serialPortConnection from '../sideEffects/serialPortConnection'
import closeSerialPort from '../sideEffects/closeSerialPort'
import writeToSerialPort from '../sideEffects/writeToSerialPort'

export const initialState = Record({
  serialPort: null,
  isResetting: false,
  closedByErrorOrEStop: false,
  config: null,
})()

const isOpen = state => (
  state.serialPort != null
  && state.serialPort.isOpen === true
)

/*
 * controls a serial port through side effects
 */
const serialReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const serialConfig = getDriverConfig(config).serialPort

      const nextState = state.set('config', serialConfig)

      if (state.config == null && serialConfig.simulation) {
        return loop(
          nextState,
          Cmd.action(serialReset()),
        )
      }

      return nextState
    }
    case DEVICE_CONNECTED: {
      const { device } = action.payload

      if (
        state.config.simulation === false
        && device.id !== state.config.portID
      ) return state

      return loop(
        state,
        Cmd.action(serialReset()),
      )
    }
    case SERIAL_RESET: {
      if (isOpen(state)) {
        // if a serial port is open then close it and re-open the port once it
        // has closed.
        const nextState = state.set('isResetting', true)

        return loop(
          nextState,
          Cmd.run(closeSerialPort, {
            args: [{
              serialPort: state.serialPort,
            }],
          }),
        )
      }

      // if the serial port is closed then open it immediately
      return loop(
        state,
        Cmd.action(connectPrinter()),
      )
    }
    case CONNECT_PRINTER: {
      if (isOpen(state)) {
        const err = 'Cannot connect printer while previous serial port is open'
        throw new Error(err)
      }

      return loop(
        initialState.set('config', state.config),
        Cmd.action(requestSerialPortConnection()),
      )
    }
    case REQUEST_SERIAL_PORT_CONNECTION: {
      const {
        portID,
        baudRate,
        simulation,
      } = state.config

      const serialPortOptions = {
        portID,
        baudRate,
        receiveParser: rxParser,
        simulator: simulation ? simulator : null,
      }

      return loop(
        initialState.set('config', state.config),
        Cmd.run(serialPortConnection, {
          args: [
            serialPortOptions,
            Cmd.dispatch,
          ],
          successActionCreator: serialPortCreated,
        }),
      )
    }
    case SERIAL_PORT_CREATED: {
      return state
        .set('serialPort', action.payload.serialPort)
    }
    case SERIAL_SEND: {
      // Resets are handled by reconnecting the serial port
      if (action.payload.code === 'M999') return state

      // Sometimes estops are attempted after the serial port is closed
      // ignore them - an error will be thrown by the status reducer.
      if (state.serialPort === null && action.payload.code === 'M999') {
        return state
      }

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
    case SERIAL_CLOSE: {
      const nextState = initialState.set('config', state.config)

      if (state.closedByErrorOrEStop) {
        return nextState
      }

      const nextAction = (() => {
        if (state.isResetting) return requestSerialPortConnection()
        return printerDisconnected()
      })()

      return loop(
        nextState,
        Cmd.action(nextAction),
      )
    }
    case DRIVER_ERROR:
    case ESTOP: {
      const nextState = state.set('closedByErrorOrEStop', true)
      return loop(
        nextState,
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
