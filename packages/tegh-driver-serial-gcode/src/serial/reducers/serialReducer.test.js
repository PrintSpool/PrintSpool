import { List } from 'immutable'
import { Cmd } from 'redux-loop'

import {
  CONNECT_PRINTER,
  DRIVER_ERROR,
  ESTOP,
  SET_CONFIG,
  setConfig,
  printerDisconnected,
  connectPrinter,
  MockConfig,
} from 'tegh-core'

import rxParser from '../../rxParser'

import requestSerialPortConnection, { REQUEST_SERIAL_PORT_CONNECTION } from '../actions/requestSerialPortConnection'
import serialPortCreated, { SERIAL_PORT_CREATED } from '../actions/serialPortCreated'
import serialSend, { SERIAL_SEND } from '../actions/serialSend'
import serialClose, { SERIAL_CLOSE } from '../actions/serialClose'

import serialPortConnection from '../sideEffects/serialPortConnection'
import closeSerialPort from '../sideEffects/closeSerialPort'
import writeToSerialPort from '../sideEffects/writeToSerialPort'

import reducer, { initialState } from './serialReducer'

const serialPortID = '/dev/whatever'
const baudRate = 9000

const config = MockConfig()
  .updateIn(['printer', 'components', 0, 'model'], m => m.merge({
    serialPortID,
    baudRate,
    simulate: false,
  }))

const configuredState = initialState
  .set('config', config.printer.components.get(0).model.toJS())

describe('serialReducer', () => {
  describe(SET_CONFIG, () => {
    it('stores the serial port configuration options', () => {
      const action = setConfig({ config, plugins: List() })

      const nextState = reducer(initialState, action)

      expect(nextState).toEqual(configuredState)
    })
  })

  describe(CONNECT_PRINTER, () => {
    describe('when a serial connection does not exist', () => {
      it('requests a serial port connection', () => {
        const action = connectPrinter()

        const [
          nextState,
          { actionToDispatch: nextAction },
        ] = reducer(initialState, action)

        expect(nextState).toEqual(initialState)
        expect(nextAction).toEqual(requestSerialPortConnection())
      })
    })
    describe('when a serial connection exists', () => {
      it('resets the serial connection', () => {
        const state = initialState.set('serialPort', 'my_serial_port')
        const action = connectPrinter()

        const [
          nextState,
          sideEffect,
        ] = reducer(state, action)

        expect(nextState).toEqual(state.set('isResetting', true))
        expect(sideEffect.func).toEqual(closeSerialPort)
        expect(sideEffect.args).toEqual([{ serialPort: 'my_serial_port' }])
      })
    })
  })

  describe(REQUEST_SERIAL_PORT_CONNECTION, () => {
    it('creates a serial port connection', () => {
      const action = requestSerialPortConnection()

      const [
        nextState,
        sideEffect,
      ] = reducer(configuredState, action)

      expect(nextState).toEqual(configuredState)
      expect(sideEffect.func).toEqual(serialPortConnection)
      expect(sideEffect.args).toEqual([
        {
          serialPortID,
          baudRate,
          receiveParser: rxParser,
          simulator: null,
        },
        Cmd.dispatch,
      ])
    })
  })

  describe(SERIAL_PORT_CREATED, () => {
    it('save the serialPort in the state', () => {
      const action = serialPortCreated({ serialPort: 'my_serial_port' })

      const nextState = reducer(initialState, action)

      expect(nextState).toEqual(
        initialState.set('serialPort', 'my_serial_port'),
      )
    })
  })

  describe(SERIAL_SEND, () => {
    it('sends the gcode line to the printer the via the serial port', () => {
      const state = initialState.set('serialPort', 'my_serial_port')
      const action = serialSend('G1 X10', { lineNumber: 10 })

      const [
        nextState,
        sideEffect,
      ] = reducer(state, action)

      expect(nextState).toEqual(state)
      expect(sideEffect.func).toEqual(writeToSerialPort)
      expect(sideEffect.args).toEqual([{
        serialPort: 'my_serial_port',
        line: 'N10 G1 X10*96\n',
      }])
    })
  })
  describe(SERIAL_CLOSE, () => {
    describe('when the reducer is resetting the serial port', () => {
      it('requests a serial port reconnnect', () => {
        const state = initialState
          .set('serialPort', 'my_serial_port')
          .set('isResetting', true)

        const action = serialClose({ serialPortID: '/dev/whatever' })

        const [
          nextState,
          { actionToDispatch: nextAction },
        ] = reducer(state, action)

        expect(nextState).toEqual(initialState)
        expect(nextAction).toEqual(requestSerialPortConnection())
      })
    })
    describe('when the serial port was closed outside of a reset', () => {
      it('dispatches PRINTER_DISCONNECTED', () => {
        const state = initialState
          .set('serialPort', 'my_serial_port')

        const action = serialClose({ serialPortID: '/dev/whatever' })

        const [
          nextState,
          { actionToDispatch: nextAction },
        ] = reducer(state, action)

        expect(nextState).toEqual(initialState)
        expect(nextAction).toEqual(printerDisconnected())
      })
    })
  })

  const actionsToCloseOn = [
    DRIVER_ERROR,
    ESTOP,
  ]
  actionsToCloseOn.forEach((type) => {
    describe(type, () => {
      it('closes the serialPort', () => {
        const state = initialState.set('serialPort', 'my_serial_port')
        const action = { type }

        const [
          nextState,
          sideEffect,
        ] = reducer(state, action)

        expect(nextState).toEqual(state.set('closedByErrorOrEStop', true))
        expect(sideEffect.func).toEqual(closeSerialPort)
        expect(sideEffect.args).toEqual([{
          serialPort: 'my_serial_port',
        }])
      })
    })
  })
})
