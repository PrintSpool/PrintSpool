// @flow
import serialMiddleware from '../src'

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

    serialMiddleware({ serialPort })(store)

    expect(serialPort.open.mock.calls.length).toBe(1)
  },
)

test(
  'dispatches SERIAL_OPEN action',
  () => {
    const { eventListeners, serialPort, store } = serialMocks()

    serialMiddleware({ serialPort })(store)
    eventListeners.open()

    expect(store.dispatch.mock.calls.length).toBe(1)
    expect(store.dispatch.mock.calls[0][0].type).toBe('SERIAL_OPEN')
  },
)

test(
  'dispatches SERIAL_RECEIVE action',
  () => {
    const { eventListeners, serialPort, store } = serialMocks()

    serialMiddleware({ serialPort })(store)
    eventListeners.data('social constructs')

    expect(store.dispatch.mock.calls.length).toBe(1)
    expect(store.dispatch.mock.calls[0][0]).toEqual({
      type: 'SERIAL_RECEIVE',
      data: 'social constructs',
    })
  },
)

test(
  'dispatches SERIAL_ERROR action',
  () => {
    const { eventListeners, serialPort, store } = serialMocks()

    serialMiddleware({ serialPort })(store)
    eventListeners.error('giraffe')

    expect(store.dispatch.mock.calls.length).toBe(1)
    expect(store.dispatch.mock.calls[0][0]).toEqual({
      type: 'SERIAL_ERROR',
      error: 'giraffe',
    })
  },
)

test(
  'sends SERIAL_SEND data over the serial port and passes the action to next',
  () => {
    const { eventListeners, serialPort, store } = serialMocks()

    const next = ({ type }) => (type === 'SERIAL_SEND' ? 'ottawa' : 'not_ottawa')
    const action = {
      type: 'SERIAL_SEND',
      data: 'kitties',
    }

    const result = serialMiddleware({ serialPort })(store)(next)(action)

    expect(serialPort.write.mock.calls.length).toBe(1)
    expect(serialPort.write.mock.calls[0][0]).toEqual('kitties')
    expect(result).toBe('ottawa')
  },
)

test(
  'passes through unrelated actions to next',
  () => {
    const { eventListeners, serialPort, store } = serialMocks()

    const next = () => 'reasons'
    const action = {
      type: 'RAISE_LEVEL_OVER_9000',
    }

    const result = serialMiddleware({ serialPort })(store)(next)(action)

    expect(serialPort.write.mock.calls.length).toBe(0)
    expect(result).toBe('reasons')
  },
)
