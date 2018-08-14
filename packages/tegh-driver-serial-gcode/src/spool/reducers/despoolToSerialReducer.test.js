import { List } from 'immutable'

import { SPOOL_TASK } from 'tegh-server'
import { DESPOOL_TASK } from 'tegh-server'

import despoolToSerialSaga from './despoolToSerialSaga'
import serialSend from '../actions/serialSend'

const despoolAction = { type: DESPOOL_TASK }
const spoolAction = { type: SPOOL_TASK }

const sentLine = {
  ...serialSend('(╯°□°）╯︵ ┻━┻', { lineNumber: 1995 }),
  [SAGA_ACTION]: true,
}

const sentEmergencyLine = {
  ...serialSend('(╯°□°）╯︵ ┻━┻', { lineNumber: false }),
  [SAGA_ACTION]: true,
}

const selectors = {
  shouldSendSpooledLineToPrinter: () => false,
  getCurrentLine: () => '(╯°□°）╯︵ ┻━┻',
  getCurrentSerialLineNumber: () => 1995,
  isEmergency: () => false,
  isReady: () => true,
}

const createTester = (selectorOverrides = {}) => {
  const sagaTester = new SagaTester({ initialState: {} })
  sagaTester.start(despoolToSerialSaga({
    ...selectors,
    ...selectorOverrides,
  }))
  return sagaTester
}

describe(DESPOOL_TASK, () => {
  it('sends next line', async () => {
    const sagaTester = createTester()
    sagaTester.dispatch(despoolAction)

    const result = sagaTester.getCalledActions()

    expect(result).toMatchObject([
      despoolAction,
      sentLine,
    ])
  })

  it('does nothing if the printer is not ready', async () => {
    const sagaTester = createTester({
      isReady: () => false,
    })
    sagaTester.dispatch(despoolAction)

    const result = sagaTester.getCalledActions()

    expect(result).toMatchObject([
      despoolAction,
    ])
  })
})

describe(SPOOL_TASK, () => {
  it('sends next line when shouldSendSpooledLineToPrinter is true', () => {
    const sagaTester = createTester({
      shouldSendSpooledLineToPrinter: () => true,
    })
    sagaTester.dispatch(spoolAction)

    const result = sagaTester.getCalledActions()

    expect(result).toMatchObject([
      spoolAction,
      sentLine,
    ])
  })

  it('does nothing if the printer is not ready', async () => {
    const sagaTester = createTester({
      isReady: () => false,
      shouldSendSpooledLineToPrinter: () => true,
    })
    sagaTester.dispatch(spoolAction)

    const result = sagaTester.getCalledActions()

    expect(result).toMatchObject([
      spoolAction,
    ])
  })

  it('if the printer is not ready it sends the line in emergencies', () => {
    const sagaTester = createTester({
      shouldSendSpooledLineToPrinter: () => true,
      isEmergency: () => true,
      isReady: () => false,
    })
    sagaTester.dispatch(spoolAction)

    const result = sagaTester.getCalledActions()

    expect(result).toMatchObject([
      spoolAction,
      sentEmergencyLine,
    ])
  })

  it('does not send line numbers in emergencies', () => {
    const sagaTester = createTester({
      shouldSendSpooledLineToPrinter: () => true,
      isEmergency: () => true,
    })
    sagaTester.dispatch(spoolAction)

    const result = sagaTester.getCalledActions()

    expect(result).toMatchObject([
      spoolAction,
      sentEmergencyLine,
    ])
  })

  it('does nothing when the printer is not idle', async () => {
    const sagaTester = createTester()
    sagaTester.dispatch(spoolAction)

    const result = sagaTester.getCalledActions()

    expect(result).toMatchObject([
      spoolAction
    ])
  })
})
