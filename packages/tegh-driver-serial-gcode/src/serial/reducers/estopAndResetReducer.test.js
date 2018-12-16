import { Set } from 'immutable'

import {
  estop,
  connectPrinter,
  despoolTask,
  MockTask,
} from 'tegh-core'

import reducer, { initialState } from './estopAndResetReducer'

describe('estopAndResetReducer', () => {
  it('dispatches an ESTOP if an eStop macro is sent', () => {
    const action = despoolTask(MockTask({
      data: ['eStop'],
      currentLineNumber: 0,
    }), Set())

    const [
      nextState,
      { actionToDispatch: nextAction },
    ] = reducer(initialState, action)

    expect(nextState).toEqual(initialState)
    expect(nextAction).toEqual(estop())
  })

  it('dispatches a RESET_SERIAL action if a reset macro is sent', () => {
    const action = despoolTask(MockTask({
      data: ['reset'],
      currentLineNumber: 0,
    }), Set())

    const [
      nextState,
      { actionToDispatch: nextAction },
    ] = reducer(initialState, action)

    expect(nextState).toEqual(initialState)
    expect(nextAction).toEqual(connectPrinter())
  })

  it('does nothing on other GCodes', () => {
    const action = despoolTask(MockTask({
      data: ['G1 X10'],
      currentLineNumber: 0,
    }), Set())

    const nextState = reducer(initialState, action)

    expect(nextState).toEqual(initialState)
  })
})
