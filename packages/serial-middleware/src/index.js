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
}:{
  serialPort: SerialPort,
  parser?: SerialPort,
  receiveParser?: (string) => mixed,
}) => (store: Store) => {
  const onOpen = () => {
      store.dispatch({
        type: 'SERIAL_OPEN'
      })
  }

  const onClose = () => {
    store.dispatch({
      type: 'SERIAL_CLOSE',
      resetByMiddleware: serialPort.resetByMiddleware,
    })
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
      })
    } else if (action.type === 'SERIAL_OPEN') {
      serialPort.open()
    }
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
