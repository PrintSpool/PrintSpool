import reducer, { initialState } from './statusReducer'

import connectPrinter from '../actions/connectPrinter'
import printerReady from '../actions/printerReady'
import driverError, { DRIVER_ERROR } from '../actions/driverError'
import estop from '../actions/estop'
import printerDisconnected from '../actions/printerDisconnected'

import spoolTask, { SPOOL_TASK } from '../../spool/actions/spoolTask'

import { MockTask } from '../../spool/types/Task'
import { EMERGENCY } from '../../spool/types/PriorityEnum'

import {
  ERRORED,
  ESTOPPED,
  DISCONNECTED,
  CONNECTING,
  READY,
} from '../types/statusEnum'

const errorPayload = {
  code: 'error_101',
  message: 'Error 101 is an error code I just made up',
}

describe('statusReducer', () => {
  describe(DRIVER_ERROR, () => {
    it('sets the error', () => {
      const action = driverError(errorPayload)
      const nextState = reducer(initialState, action)

      expect(nextState.error).toEqual(errorPayload)
    })
  })

  const statusChangingActions = [
    { action: driverError(errorPayload), status: ERRORED },
    { action: estop(), status: ESTOPPED },
    { action: printerDisconnected(), status: DISCONNECTED },
    { action: connectPrinter(), status: CONNECTING },
    { action: printerReady(), status: READY },
  ]
  statusChangingActions.forEach(({ action, status }) => {
    describe(action.type, () => {
      it(`sets the status to ${status}`, () => {
        const nextState = reducer(initialState, action)

        expect(nextState.status).toEqual(status)
      })
    })
  })

  describe(SPOOL_TASK, () => {
    describe('when the printer is ready', () => {
      it('allows the task to be spooled', () => {
        const action = spoolTask(MockTask())
        const state = initialState.set('status', READY)
        const nextState = reducer(state, action)

        expect(nextState).toEqual(state)
      })
    })
    describe('when the printer is not ready', () => {
      describe('and an emergency task is spooled', () => {
        it('allows the task to be spooled', () => {
          const action = spoolTask(MockTask({
            priority: EMERGENCY,
          }))
          const state = initialState.set('status', DISCONNECTED)
          const nextState = reducer(state, action)

          expect(nextState).toEqual(initialState)
        })
      })
      describe('and the task is not an emergency', () => {
        it('throws an error to prevent the task from spooling', () => {
          const action = spoolTask(MockTask())
          const state = initialState.set('status', DISCONNECTED)

          expect(() => reducer(state, action)).toThrow()
        })
      })
    })
  })
})
