import { Set } from 'immutable'
import {
  despoolTask,
  DESPOOL_TASK,
  requestDespool,
  driverError,
  MockTask,
} from 'tegh-core'

import reducer, {
  initialState,
  REQUEST_DESPOOL_ON_OK,
  RESEND_ON_OK,
  IGNORE_OK,
} from './despoolToSerialReducer'

import serialSend, { SERIAL_SEND } from '../../serial/actions/serialSend'
import serialReceive, { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'

import rxParser from '../../rxParser'

describe('despoolToSerialReducer', () => {
  describe(DESPOOL_TASK, () => {
    it('sends next line', () => {
      const task = MockTask({
        data: ['line_0', 'G1 X10', 'line_2'],
        currentLineNumber: 1,
      })
      const action = despoolTask(task, Set())

      const {
        actionToDispatch: nextAction,
      } = reducer(initialState, action)[1]

      expect(nextAction).toEqual(
        serialSend({ macro: 'G1', args: { x: 10 }, lineNumber: 1 }),
      )
    })
  })

  describe(SERIAL_SEND, () => {
    describe('when a line number is present', () => {
      it('increments the line number', () => {
        const action = serialSend({
          macro: 'G1337',
          args: {},
          lineNumber: 9000,
        })

        const state = reducer(initialState, action)

        expect(state.currentSerialLineNumber).toEqual(9001)
      })
    })
    describe('when a line number is not present', () => {
      it('does nothing', () => {
        const action = serialSend({
          macro: 'G1337',
          args: {},
          lineNumber: false,
        })

        const state = reducer(initialState, action)

        expect(state.currentSerialLineNumber).toEqual(1)
      })
    })
  })

  describe(SERIAL_RECEIVE, () => {
    describe('ok', () => {
      const action = serialReceive({ data: 'ok', receiveParser: rxParser })

      describe(REQUEST_DESPOOL_ON_OK, () => {
        it('requests a despool', () => {
          const state = initialState.set('onNextOK', REQUEST_DESPOOL_ON_OK)

          const [
            nextState,
            {
              actionToDispatch: nextAction,
            },
          ] = reducer(state, action)

          expect(nextState).toEqual(state)
          expect(nextAction).toEqual(requestDespool())
        })
      })
      describe(IGNORE_OK, () => {
        it('ignores the response on onNextOK = IGNORE_OK', () => {
          const state = initialState.set('onNextOK', IGNORE_OK)

          const nextState = reducer(state, action)

          expect(nextState.onNextOK).toEqual(REQUEST_DESPOOL_ON_OK)
        })
      })
      describe(RESEND_ON_OK, () => {
        it('resends the current line', () => {
          const task = MockTask({
            currentLineNumber: 0,
            data: ['(╯°□°）╯︵┻━┻'],
          })

          const state = initialState
            .set('onNextOK', RESEND_ON_OK)
            .set('currentSerialLineNumber', 2002)
            .set('lastTaskSent', task)


          const [
            nextState,
            {
              actionToDispatch: nextAction,
            },
          ] = reducer(state, action)

          expect(nextState.onNextOK).toEqual(IGNORE_OK)
          expect(nextAction).toEqual(
            serialSend({
              macro: '(╯°□°）╯︵┻━┻',
              args: {},
              lineNumber: 2001,
            }),
          )
        })
      })
    })
    describe('resend', () => {
      const action = serialReceive({
        data: 'resend N9000',
        receiveParser: rxParser,
      })

      describe('when the resend line number matches the last line sent', () => {
        it('sets onNextOK to RESEND_ON_OK', () => {
          const state = initialState
            .set('currentSerialLineNumber', 9001)

          const nextState = reducer(state, action)

          expect(nextState.onNextOK).toEqual(RESEND_ON_OK)
        })
      })

      describe('when the resend line number does not match the last line sent', () => {
        it('throws an error', () => {
          const state = initialState
            .set('currentSerialLineNumber', 42)

          expect(() => {
            reducer(state, action)
          }).toThrow()
        })
      })
    })
    describe('error', () => {
      it('reports a FIRMWARE_ERROR', () => {
        const task = MockTask({
          name: 'my_task',
          currentLineNumber: 1337,
        })

        const action = serialReceive({
          data: 'error:9001 (╯°□°）╯︵ ┻━┻',
          receiveParser: rxParser,
        })

        const state = initialState
          .set('lastTaskSent', task)

        const [
          nextState,
          {
            actionToDispatch: nextAction,
          },
        ] = reducer(state, action)

        expect(nextState).toEqual(state)
        expect(nextAction).toEqual(driverError({
          code: 'FIRMWARE_ERROR',
          message: 'my_task:1337: 9001 (╯°□°）╯︵ ┻━┻',
        }))
      })
    })
  })
})
