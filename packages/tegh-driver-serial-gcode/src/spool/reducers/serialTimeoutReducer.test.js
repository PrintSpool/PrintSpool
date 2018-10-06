import Promise from 'bluebird'
import { Cmd } from 'redux-loop'

import { createTestConfig } from '../../config/types/Settings'

import reducer, { initialState } from './serialTimeoutReducer'

import rxParser from '../../rxParser'

import serialReceive, { SERIAL_RECEIVE } from '../../serial/actions/serialReceive'
import serialSend, { SERIAL_SEND } from '../../serial/actions/serialSend'
import requestSerialPortTickle, { REQUEST_SERIAL_PORT_TICKLE } from '../actions/requestSerialPortTickle'

const fastCodeTimeout = 42
const longRunningCodeTimeout = 1111

const config = createTestConfig({
  serialTimeout: {
    fastCodeTimeout,
    longRunningCodeTimeout,
    tickleAttempts: 3,
  },
})

// const fastCodeTimeout = 3000
// const longRunningCodeTimeout = 10000
//
// const tickleMCodeAction = {
//   ...serialSend('M105', { lineNumber: false }),
//   tickle: true,
//   [SAGA_ACTION]: true,
// }
//
// const okReceivedAction = {
//   type: SERIAL_RECEIVE,
//   data: {
//     type: 'ok',
//   },
// }
//
// const feedbackReceivedAction = {
//   type: SERIAL_RECEIVE,
//   data: {
//     type: 'feedback',
//   },
// }

describe('serialTimeoutReducer', () => {
  describe(SERIAL_SEND, () => {
    it('does nothing if a line number is not sent', () => {
      const action = {
        ...serialSend('G1 X10', { lineNumber: false }),
        config,
      }

      const nextState = reducer(initialState, action)

      expect(nextState.awaitingLineNumber).toEqual(null)
    })

    const timeoutScenarios = [
      {
        description: 'for long running gcodes',
        timeoutName: 'long running gcode timeout',
        gcode: 'G28',
        codeTimeout: longRunningCodeTimeout,
      },
      {
        description: 'for fast gcodes',
        timeoutName: 'fast gcode timeout',
        gcode: 'G1 X10',
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
            ...serialSend(gcode, { lineNumber: 123 }),
            config,
          }

          const [
            nextState,
            sideEffect,
          ] = reducer(initialState, action)

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
      const state = initialState.set('awaitingLineNumber', 2000)
      const action = serialReceive({ data: 'ok', receiveParser: rxParser })

      const nextState = reducer(state, action)

      expect(nextState.awaitingLineNumber).toEqual(null)
    })
  })

  describe(REQUEST_SERIAL_PORT_TICKLE, () => {
    describe('if the line number does not match the one that is awaited', () => {
      it('does nothing', () => {
        const state = initialState.set('awaitingLineNumber', 2000)
        const action = requestSerialPortTickle({ awaitingLineNumber: 1999 })

        const nextState = reducer(state, action)

        expect(nextState).toEqual(state)
      })
    })
    describe('if there are still tickle attempts left to try', () => {
      it('tickles the serial port with an M105', () => {
        const timeoutPeriod = 24816
        const state = initialState
          .set('ticklesAttempted', 2)
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

        expect(nextState).toEqual(state.set('ticklesAttempted', 3))

        expect(nextAction).toEqual(
          serialSend('M105', { lineNumber: false }),
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
          }
        )

        // expect(nextAction).toEqual(state)
      })
    })
    describe('if the max number of tickle attempts has already been attempted', () => {
      it('dispatches a serial timeout driver error', () => {

      })
    })
  })
})
//   [true, false].forEach((long) => {
//     describe()
//     describe(
//       `when no response is received for ${long ? 'long running' : 'fast'} `
//       + 'codes it sends M105',
//       () => {
//         const expectToStopsTicklingAfter = ({ action }) => {
//           expectTickle({ sagaTester, delayMock, tickleCount: 0 })
//           expectTickle({ sagaTester, delayMock, tickleCount: 1 })
//           sagaTester.dispatch(action)
//           /*
//            * Even if the pause expires after the ok is received the saga
//            * should not put another tickle.
//            */
//           const pause = delayMock.unacknowledgedDelay
//           pause.next(true)
//
//           const result = sagaTester.getCalledActions()
//
//           expect(result).toMatchObject([
//             sentGCodeAction,
//             tickleMCodeAction,
//             tickleMCodeAction,
//             action,
//           ])
//         }
//
//         test(
//           'if the firmware sends back \'ok\' it stops tickling',
//           () => {
//             expectToStopsTicklingAfter({
//               action: okReceivedAction,
//             })
//           },
//         )
//
//         test(
//           'if the firmware sends temperature feedback it stops tickling',
//           () => {
//             expectToStopsTicklingAfter({
//               action: feedbackReceivedAction,
//             })
//           },
//         )
//
//         test(
//           'if the firmware does not respond to multiple tickles it puts '
//           + 'DRIVER_ERROR',
//           () => {
//             const {
//               sagaTester,
//               delayMock,
//               sentGCodeAction,
//             } = startingConditions({ long })
//             expectTickle({ sagaTester, delayMock, tickleCount: 0 })
//             expectTickle({ sagaTester, delayMock, tickleCount: 1 })
//             expectTickle({ sagaTester, delayMock, tickleCount: 2 })
//
//             const result = sagaTester.getCalledActions()
//
//             expect(result).toMatchObject([
//               sentGCodeAction,
//               tickleMCodeAction,
//               tickleMCodeAction,
//               tickleMCodeAction,
//               serialTimeoutAction,
//             ])
//           },
//         )
//
//         test(
//           'if the saga is cancelled it stops tickling',
//           () => {
//             const {
//               sagaTester,
//               delayMock,
//               sentGCodeAction,
//             } = startingConditions({ long })
//             sagaTester.dispatch(cancelAction)
//             causeTimeout({ delayMock })
//
//             const result = sagaTester.getCalledActions()
//
//             expect(result).toMatchObject([
//               sentGCodeAction,
//               cancelAction,
//             ])
//           },
//         )
//       },
//     )
//   })
//   test(
//     'when a \'ok\' response is received before the timeout it does nothing',
//     () => {
//       const {
//         sagaTester,
//         delayMock,
//         sentGCodeAction,
//       } = startingConditions({ long: false })
//       sagaTester.dispatch(okReceivedAction)
//       sagaTester.dispatch(sentGCodeAction)
//       sagaTester.dispatch(okReceivedAction)
//
//       const result = sagaTester.getCalledActions()
//
//       expect(result).toMatchObject([
//         sentGCodeAction,
//         okReceivedAction,
//         sentGCodeAction,
//         okReceivedAction,
//       ])
//     },
//   )
//   test(
//     'when a feedback response is received before the timeout it does nothing',
//     () => {
//       const {
//         sagaTester,
//         delayMock,
//         sentGCodeAction,
//       } = startingConditions({ long: false })
//       sagaTester.dispatch(feedbackReceivedAction)
//
//       /*
//        * Even if the pause expires after the feedback is received the saga
//        * should not put another tickle.
//        */
//       const pause = delayMock.unacknowledgedDelay
//       pause.next(true)
//
//       const result = sagaTester.getCalledActions()
//
//       expect(result).toMatchObject([
//         sentGCodeAction,
//         feedbackReceivedAction,
//       ])
//     },
//   )
// })
