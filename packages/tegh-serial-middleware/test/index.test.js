// @flow
import serialMiddleware from '../src/'

const serialMocks = () => {
  const eventListeners = {}

  const serialPort = {
    on: (fnName, fn) => {
      eventListeners[fnName] = fn
      return serialPort
    },
    open: jest.fn(),
    write: jest.fn(),
  }

  const store = {
    dispatch: jest.fn(),
  }

  return { eventListeners, serialPort, store }
}

test(
  'opens the serial port',
  () => {
    const { eventListeners, serialPort, store } = serialMocks()

    serialMiddleware(serialPort)(store)

    expect(serialPort.open.mock.calls.length).toBe(1)
  }
)

test(
  'dispatches SERIAL_OPEN action',
  () => {
    const { eventListeners, serialPort, store } = serialMocks()

    serialMiddleware(serialPort)(store)
    eventListeners.open()

    expect(store.dispatch.mock.calls.length).toBe(1)
    expect(store.dispatch.mock.calls[0][0].type).toBe('SERIAL_OPEN')
  }
)
