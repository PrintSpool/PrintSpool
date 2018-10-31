import {
  estop,
} from 'tegh-core'

import reducer, { initialState } from './estopAndResetReducer'

import serialSend from '../actions/serialSend'
import serialReset from '../actions/serialReset'

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

  it('dispatches a RESET_SERIAL action if M999 is sent', () => {
    const action = serialSend('M999', { lineNumber: false })

    const [
      nextState,
      { actionToDispatch: nextAction },
    ] = reducer(initialState, action)

    expect(nextState).toEqual(initialState)
    expect(nextAction).toEqual(serialReset())
  })

  it('does nothing on other GCodes', () => {
    const action = serialSend('G1 X10', { lineNumber: false })

    const nextState = reducer(initialState, action)

    expect(nextState).toEqual(initialState)
  })
})
