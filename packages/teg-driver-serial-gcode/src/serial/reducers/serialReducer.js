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
  getController,
} from '@tegapp/core'

import rxParser from '../../rxParser'
import simulator from '../simulator'

import getSerialPortID from '../selectors/getSerialPortID'

import requestSerialPortConnection, { REQUEST_SERIAL_PORT_CONNECTION } from '../actions/requestSerialPortConnection'
import serialPortCreated, { SERIAL_PORT_CREATED } from '../actions/serialPortCreated'
import { SERIAL_SEND } from '../actions/serialSend'
import { SERIAL_CLOSE } from '../actions/serialClose'

import serialPortConnection from '../sideEffects/serialPortConnection'
import closeSerialPort from '../sideEffects/closeSerialPort'
import writeToSerialPort from '../sideEffects/writeToSerialPort'

export const initialState = Record({
  serialPort: null,
  serialPortID: null,
  isResetting: false,
  closedByErrorOrEStop: false,
  config: null,
})()

/*
 * controls a serial port through side effects
 */
const serialReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const controllerConfig = getController(config).model.toJS()

      const nextState = state
        .set('config', controllerConfig)
        .set('serialPortID', getSerialPortID(config))

      return nextState
    }
    case DEVICE_CONNECTED: {
      const { device } = action.payload

      if (device.id !== state.serialPortID) return state

      return loop(
        state,
        Cmd.action(connectPrinter()),
      )
    }
    case CONNECT_PRINTER: {
      if (state.serialPort != null) {
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
        Cmd.action(requestSerialPortConnection()),
      )
    }
    case REQUEST_SERIAL_PORT_CONNECTION: {
      const {
        baudRate,
        simulate,
      } = state.config

      const serialPortOptions = {
        serialPortID: state.serialPortID,
        baudRate,
        receiveParser: rxParser,
        simulator: simulate ? simulator : null,
      }

      return loop(
        state,
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
      const {
        line,
        macro,
        args,
      } = action.payload

      if (state.serialPort === null) {
        throw new Error(`Cannot write to disconnected serialPort: ${line}`)
      }

      return loop(
        state,
        Cmd.run(writeToSerialPort, {
          args: [{
            serialPort: state.serialPort,
            line,
            macro,
            args,
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
