import Promise from 'bluebird'
import { Cmd } from 'redux-loop'

import {
  // DRIVER_ERROR,
  // ESTOP,
  // PRINTER_DISCONNECTED,
  // CONNECT_PRINTER,
  printerReady,
} from 'tegh-core'

import reducer, { initialState } from './greetingReducer'

import serialReceive, { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import serialSend from '../../serial/actions/serialSend'
import rxParser from '../../rxParser'

import greetingDelayDone, { GREETING_DELAY_DONE } from '../actions/greetingDelayDone'


describe('greetingReducer', () => {
  describe(SERIAL_RECEIVE, () => {
    describe('on receiving a greeting', () => {
      it('sends hello after a delay', async () => {
        const state = initialState
          .set('isConnecting', true)
          .set('delayAfterGreeting', 1337)
          .set('awaitingGreeting', true)
        const action = serialReceive({ data: 'start', receiveParser: rxParser })

        const [
          nextState,
          sideEffect,
        ] = reducer(state, action)

        expect(nextState).toEqual(state.set('awaitingGreeting', false))
        expect(sideEffect).toEqual(
          Cmd.run(Promise.delay, {
            args: [1337],
            successActionCreator: greetingDelayDone,
          }),
        )
      })
    })

    describe('on receiving a \'ok\' to the hello message', () => {
      it('dispatches PRINTER_READY', async () => {
        const state = initialState.set('isConnecting', true)
        const action = serialReceive({ data: 'ok', receiveParser: rxParser })

        const [
          nextState,
          { actionToDispatch: nextAction },
        ] = reducer(state, action)

        expect(nextState.isConnecting).toEqual(false)
        expect(nextAction).toEqual(printerReady())
      })
    })
  })
  describe(GREETING_DELAY_DONE, () => {
    it('attempts to provoke a response from the printer with an M110', () => {
      const state = initialState.set('isConnecting', true)
      const action = greetingDelayDone()

      const [
        nextState,
        { actionToDispatch: nextAction },
      ] = reducer(state, action)

      expect(nextState).toEqual(state)
      expect(nextAction).toEqual(serialSend('M110 N0', { lineNumber: false }))
    })
  })
})
