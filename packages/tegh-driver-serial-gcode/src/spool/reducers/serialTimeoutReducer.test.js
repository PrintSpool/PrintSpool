import { List } from 'immutable'
import Promise from 'bluebird'
import { Cmd } from 'redux-loop'

import { setConfig, SET_CONFIG, MockConfig } from 'tegh-core'

import reducer, { initialState } from './serialTimeoutReducer'

import rxParser from '../../rxParser'

import serialReceive, { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import serialSend, { SERIAL_SEND } from '../../serial/actions/serialSend'
import serialTimeout from '../../serial/actions/serialTimeout'
import requestSerialPortTickle, { REQUEST_SERIAL_PORT_TICKLE } from '../actions/requestSerialPortTickle'

const fastCodeTimeout = 42
const longRunningCodeTimeout = 1111
const maxTickleAttempts = 5

const config = MockConfig()
  .updateIn(['printer', 'components', 0, 'model'], c => c.merge({
    responseTimeoutTickleAttempts: maxTickleAttempts,
    fastCodeTimeout,
    longRunningCodeTimeout,
    longRunningCodes: ['G28'],
  }))

const configuredState = initialState.mergeIn(['config'], {
  responseTimeoutTickleAttempts: maxTickleAttempts,
  fastCodeTimeout,
  longRunningCodeTimeout,
  longRunningCodes: ['G28'],
})

describe('serialTimeoutReducer', () => {
  describe(SET_CONFIG, () => {
    it('configures the timeout reducer', () => {
      const action = setConfig({ config, plugins: List() })

      const nextState = reducer(initialState, action)

      expect(nextState).toEqual(configuredState)
    })
  })

  describe(SERIAL_SEND, () => {
    it('does nothing if a line number is not sent', () => {
      const action = {
        ...serialSend({
          macro: 'G1',
          args: { X: '10' },
          lineNumber: false,
        }),
        config,
      }

      const nextState = reducer(configuredState, action)

      expect(nextState.awaitingLineNumber).toEqual(null)
    })

    const timeoutScenarios = [
      {
        description: 'for long running gcodes',
        timeoutName: 'long running gcode timeout',
        gcode: { macro: 'G28', args: {} },
        codeTimeout: longRunningCodeTimeout,
      },
      {
        description: 'for fast gcodes',
        timeoutName: 'fast gcode timeout',
        gcode: { macro: 'G1', args: { X: '10' } },
        codeTimeout: fastCodeTimeout,
      },
    ]

    timeoutScenarios.forEach(({
      description,
      timeoutName,
      gcode,
      codeTimeout,
    }) => {
      describe(description, () => {
        it(`waits the ${timeoutName} before sending a tickle`, () => {
          const action = {
            ...serialSend({ ...gcode, lineNumber: 123 }),
            config,
          }

          const [
            nextState,
            sideEffect,
          ] = reducer(configuredState, action)

          expect(nextState.awaitingLineNumber).toEqual(123)

          expect(sideEffect.successActionCreator()).toEqual(
            requestSerialPortTickle({ awaitingLineNumber: 123 }),
          )

          expect(sideEffect).toEqual(
            {
              ...Cmd.run(Promise.delay, {
                args: [codeTimeout],
              }),
              successActionCreator: sideEffect.successActionCreator,
            },
          )
        })
      })
    })
  })

  describe(SERIAL_RECEIVE, () => {
    it('cancels the tickle', () => {
      const state = configuredState.set('awaitingLineNumber', 2000)
      const action = serialReceive({ data: 'ok', receiveParser: rxParser })

      const nextState = reducer(state, action)

      expect(nextState.ticklesAttempted).toEqual(0)
      expect(nextState.awaitingLineNumber).toEqual(null)
      expect(nextState.timeoutPeriod).toEqual(null)
    })
  })

  describe(REQUEST_SERIAL_PORT_TICKLE, () => {
    describe('if the line number does not match the one that is awaited', () => {
      it('does nothing', () => {
        const state = configuredState.set('awaitingLineNumber', 2000)
        const action = requestSerialPortTickle({ awaitingLineNumber: 1999 })

        const nextState = reducer(state, action)

        expect(nextState).toEqual(state)
      })
    })
    describe('if there are still tickle attempts left to try', () => {
      it('tickles the serial port with an M105', () => {
        const timeoutPeriod = 24816
        const state = configuredState
          .set('ticklesAttempted', maxTickleAttempts - 1)
          .set('awaitingLineNumber', 2000)
          .set('timeoutPeriod', timeoutPeriod)
        const action = {
          ...requestSerialPortTickle({ awaitingLineNumber: 2000 }),
          config,
        }

        const [
          nextState,
          { cmds: [{ actionToDispatch: nextAction }, sideEffect] },
        ] = reducer(state, action)

        expect(nextState).toEqual(
          state.set('ticklesAttempted', maxTickleAttempts),
        )

        expect(nextAction).toEqual(
          serialSend({ macro: 'M105', args: {}, lineNumber: false }),
        )

        expect(sideEffect.successActionCreator()).toEqual(
          requestSerialPortTickle({ awaitingLineNumber: 2000 }),
        )

        expect(sideEffect).toEqual(
          {
            ...Cmd.run(Promise.delay, {
              args: [timeoutPeriod],
            }),
            successActionCreator: sideEffect.successActionCreator,
          },
        )
      })
    })

    describe('if the max number of tickle attempts has already been attempted', () => {
      it('dispatches a serial timeout driver error', () => {
        const state = configuredState
          .set('ticklesAttempted', maxTickleAttempts)
          .set('awaitingLineNumber', 2000)
          .set('timeoutPeriod', 123)
        const action = {
          ...requestSerialPortTickle({ awaitingLineNumber: 2000 }),
          config,
        }

        const [
          nextState,
          { actionToDispatch: nextAction },
        ] = reducer(state, action)

        expect(nextState).toEqual(state)

        expect(nextAction).toEqual(serialTimeout())
      })
    })
  })
})
