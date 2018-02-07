// @flow
import type {Dispatch} from 'redux'

type SerialPort = {
  open: () => void,
  on: ('open' | 'data' | 'error', (_: mixed) => void) => SerialPort,
  write: (string, (string) => void) => void,
}

export type SerialOpenAction = {
  type: 'SERIAL_OPEN',
}

export type SerialSendAction = {
  type: 'SERIAL_SEND',
  data: string,
}

export type SerialReceiveAction = {
  type: 'SERIAL_RECEIVE',
  data: mixed,
}

export type SerialErrorAction = {
  type: 'SERIAL_ERROR',
  error: mixed,
}

export type SerialResetAction = {
  type: 'SERIAL_RESET',
}

type DispatchedAction =
  | SerialOpenAction
  | SerialReceiveAction
  | SerialErrorAction
  | SerialResetAction

type Store = {
  dispatch: Dispatch<DispatchedAction>
}

const serialMiddleware = ({
  serialPort,
  parser,
  receiveParser = ((line) => line),
  isConnected,
}:{
  serialPort: SerialPort,
  parser?: SerialPort,
  receiveParser?: (string) => mixed,
  isConnected: () => boolean,
}) => (store: Store) => {
  const waitForConnection = () => {
    if (isConnected()) {
      serialPort.open()
    } else {
      setTimeout(waitForConnection, 200)
    }
  }
  setImmediate(waitForConnection)

  const onOpen = () => {
      parser.buffer = Buffer.alloc(0)
      store.dispatch({
        type: 'SERIAL_OPEN'
      })
  }

  const onClose = () => {
    const { resetByMiddleware } = serialPort
    store.dispatch({
      type: 'SERIAL_CLOSE',
      resetByMiddleware,
    })
    if (!resetByMiddleware) {
      waitForConnection()
    }
  }

  const onData = (data) => {
    if (typeof data !== 'string') throw 'data must be a string'
    store.dispatch({
      type: 'SERIAL_RECEIVE',
      data: receiveParser(data),
    })
  }

  const onError = (error) => {
    store.dispatch({
      type: 'SERIAL_ERROR',
      log: 'error',
      error,
    })
  }

  serialPort.on('open', onOpen)
  serialPort.on('close', onClose)
  const dataHandler = (parser || serialPort)
    .on('error', onError)
    .on('data', onData)

  return (next: {type: string} => mixed) => (action: {type: string}) => {
    if (action.type === 'SERIAL_SEND') {
      if (typeof action.data !== 'string') throw 'data must be a string'
      serialPort.write(action.data, err => {
        if (err) onError(err)
        store.dispatch({
          ...action,
          type: 'SERIAL_SENT',
        })
      })
    } else if (action.type === 'SERIAL_OPEN_REQUEST') {
      serialPort.open()
    } else if (action.type === 'SERIAL_RESET') {
      serialPort.resetByMiddleware = true
      serialPort.close(err => {
        if (err) return onError(err)
        delete serialPort.resetByMiddleware
        serialPort.open()
      })
    }
    return next(action)
  }
}

export default serialMiddleware
