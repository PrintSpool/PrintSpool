// @flow
import SagaTester from 'redux-saga-tester'

import despoolToSerialSaga from '../../src/sagas/despool_to_serial_saga'

const expectSelect = (next) => {
  expect(next.value).not.toBe(null)
  expect(next.value.SELECT).not.toBe(null)
}

test('sends next line on DESPOOL', async () => {
  const initialState = {
    spool: {
      sendSpooledLineToPrinter: false,
      currentLine: '(╯°□°）╯︵ ┻━┻',
      currentLineNumber: 1995,
    }
  }
  const sagaTester = new SagaTester({ initialState })
  sagaTester.start(despoolToSerialSaga)
  sagaTester.dispatch({ type: 'DESPOOL' })

  const result = sagaTester.getCalledActions().slice(1)

  expect(result).toEqual([{
    type: 'SERIAL_SEND',
    data: 'N1995 (╯°□°）╯︵ ┻━┻ *222',
  }])
})

test('sends next line on SPOOL when the printer is idle', () => {
  const initialState = {
    spool: {
      sendSpooledLineToPrinter: true,
      currentLine: '(╯°□°）╯︵ ┻━┻',
      currentLineNumber: 1995,
    }
  }
  const sagaTester = new SagaTester({ initialState })
  sagaTester.start(despoolToSerialSaga)
  sagaTester.dispatch({ type: 'SPOOL' })

  const result = sagaTester.getCalledActions().slice(1)

  expect(result).toEqual([{
    type: 'SERIAL_SEND',
    data: 'N1995 (╯°□°）╯︵ ┻━┻ *222',
  }])
})

test('does nothing when a SPOOL is sent and the printer is not idle', async () => {
  const initialState = {
    spool: {
      sendSpooledLineToPrinter: false,
      currentLine: '(╯°□°）╯︵ ┻━┻',
      currentLineNumber: 1995,
    }
  }
  const sagaTester = new SagaTester({ initialState })
  sagaTester.start(despoolToSerialSaga)
  sagaTester.dispatch({ type: 'SPOOL' })

  const result = sagaTester.getCalledActions().slice(1)

  expect(result).toEqual([])
})
