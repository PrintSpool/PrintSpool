import {
  estop,
  connectPrinter,
} from 'tegh-core'

import reducer, { initialState } from './estopAndResetReducer'

import serialSend from '../actions/serialSend'

describe('estopAndResetReducer', () => {
  it('dispatches an ESTOP if an M112 is sent', () => {
    const action = serialSend('M112', { lineNumber: false })

    const [
      nextState,
      { actionToDispatch: nextAction },
    ] = reducer(initialState, action)

    expect(nextState).toEqual(initialState)
    expect(nextAction).toEqual(estop())
  })

  it('dispatches a CONNECT_PRINTER action if M999 is sent', () => {
    const action = serialSend('M999', { lineNumber: false })

    const [
      nextState,
      { actionToDispatch: nextAction },
    ] = reducer(initialState, action)

    expect(nextState).toEqual(initialState)
    expect(nextAction).toEqual(connectPrinter())
  })

  it('does nothing on other GCodes', () => {
    const action = serialSend('G1 X10', { lineNumber: false })

    const nextState = reducer(initialState, action)

    expect(nextState).toEqual(initialState)
  })
})
