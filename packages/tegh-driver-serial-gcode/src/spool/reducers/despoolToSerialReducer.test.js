import { List } from 'immutable'

import {
  spoolTask,
  SPOOL_TASK,
  despoolTask,
  DESPOOL_TASK,
  MockTask,
} from 'tegh-core'

import reducer, { initialState } from './despoolToSerialReducer'
import serialSend, { SERIAL_SEND } from '../../serial/actions/serialSend'
import { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'

describe('despoolToSerialReducer', () => {
  describe(DESPOOL_TASK, () => {
    it('sends next line', () => {
      const task = MockTask({
        data: ['line_0', '(╯°□°）╯︵ ┻━┻', 'line_2'],
        currentLineNumber: 1,
      })
      const action = despoolTask(task)

      const {
        actionToDispatch: nextAction,
      } = reducer(initialState, action)[1]

      expect(nextAction).toEqual(
        serialSend('(╯°□°）╯︵ ┻━┻', { lineNumber: 1 }),
      )
    })
  })

  describe(SERIAL_SEND, () => {
    describe('when a line number is present', () => {
      it('increments the line number', () => {
        const action = serialSend('G1337 :)', { lineNumber: 9000 })

        const state = reducer(initialState, action)

        expect(state.currentSerialLineNumber).toEqual(9001)
      })
    })
    describe('when a line number is not present', () => {
      it('does nothing', () => {
        const action = serialSend('G1337 :)', { lineNumber: false })

        const state = reducer(initialState, action)

        expect(state.currentSerialLineNumber).toEqual(1)
      })
    })
  })

  describe(SERIAL_RECEIVE, () => {

  })

  // describe(SPOOL_TASK, () => {
  //   it('sends next line when shouldSendSpooledLineToPrinter is true', () => {
  //     const sagaTester = createTester({
  //       shouldSendSpooledLineToPrinter: () => true,
  //     })
  //     sagaTester(spoolAction)
  //
  //     const result = sagaTester.getCalledActions()
  //
  //     expect(result).toMatchObject([
  //       spoolAction,
  //       sentLine,
  //     ])
  //   })
  //
  //   it('does nothing if the printer is not ready', async () => {
  //     const sagaTester = createTester({
  //       isReady: () => false,
  //       shouldSendSpooledLineToPrinter: () => true,
  //     })
  //     sagaTester(spoolAction)
  //
  //     const result = sagaTester.getCalledActions()
  //
  //     expect(result).toMatchObject([
  //       spoolAction,
  //     ])
  //   })
  //
  //   it('if the printer is not ready it sends the line in emergencies', () => {
  //     const sagaTester = createTester({
  //       shouldSendSpooledLineToPrinter: () => true,
  //       isEmergency: () => true,
  //       isReady: () => false,
  //     })
  //     sagaTester(spoolAction)
  //
  //     const result = sagaTester.getCalledActions()
  //
  //     expect(result).toMatchObject([
  //       spoolAction,
  //       sentEmergencyLine,
  //     ])
  //   })
  //
  //   it('does not send line numbers in emergencies', () => {
  //     const sagaTester = createTester({
  //       shouldSendSpooledLineToPrinter: () => true,
  //       isEmergency: () => true,
  //     })
  //     sagaTester(spoolAction)
  //
  //     const result = sagaTester.getCalledActions()
  //
  //     expect(result).toMatchObject([
  //       spoolAction,
  //       sentEmergencyLine,
  //     ])
  //   })
  //
  //   it('does nothing when the printer is not idle', async () => {
  //     const sagaTester = createTester()
  //     sagaTester(spoolAction)
  //
  //     const result = sagaTester.getCalledActions()
  //
  //     expect(result).toMatchObject([
  //       spoolAction,
  //     ])
  //   })
  // })
})
