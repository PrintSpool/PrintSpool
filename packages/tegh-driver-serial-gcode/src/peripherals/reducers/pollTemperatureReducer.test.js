import { loop, Cmd } from 'redux-loop'
import {
  printerReady,
} from 'tegh-core'

import reducer from './pollTemperatureReducer'
import { createTestConfig } from '../../config/types/Settings'

// import spoolTemperatureQuery from '../actions/spoolTemperatureQuery'
import requestTemperaturePoll from '../actions/requestTemperaturePoll'

const temperaturePollingInterval = 1337

const config = createTestConfig({
  temperaturePollingInterval,
})

// const receiveOkWithTemp = {
//   type: SERIAL_RECEIVE,
//   data: {
//     type: 'ok',
//     temperatures: { e0: 10 },
//   },
// }
//
// const receiveOkWithoutTemp = {
//   type: SERIAL_RECEIVE,
//   data: {
//     type: 'ok',
//   },
// }

describe('pollTemperatureReducer', () => {
  fit('on receiving PRINTER_READY queries temperature immediately', async () => {
    const action = { ...printerReady(), config }
    const result = reducer(null, action)

    expect(result).toEqual(
      loop(null, Cmd.run(Promise.delay), {
        successActionCreator: requestTemperaturePoll,
        args: [temperaturePollingInterval],
      }),
    )
  })
  //
  // it('on receiving temperature data waits to send next poll', async () => {
  //   const { sagaTester, delayMock } = createTester()
  //   sagaTester.dispatch(receiveOkWithTemp)
  //
  //   expect(sagaTester.getCalledActions()).toEqual([
  //     receiveOkWithTemp,
  //   ])
  //
  //   expect(delayMock.unacknowledgedDelay).not.toBe(null)
  //   const pause = await delayMock.waitForDelay()
  //   expect(pause.length).toEqual(200)
  //   pause.next()
  //
  //   const result = sagaTester.getCalledActions()
  //
  //   expectSimilarActions(result, [
  //     receiveOkWithTemp,
  //     spoolTempQueryFromSaga,
  //   ])
  // })
  //
  // it('does not poll if it does not receive temperature data', async () => {
  //   const { sagaTester, delayMock } = createTester()
  //   sagaTester.dispatch(receiveOkWithoutTemp)
  //
  //   expect(delayMock.unacknowledgedDelay).toBe(null)
  //
  //   const result = sagaTester.getCalledActions()
  //
  //   expectSimilarActions(result, [
  //     receiveOkWithoutTemp,
  //   ])
  // })
})
