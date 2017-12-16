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
  data: string,
}

export type SerialErrorAction = {
  type: 'SERIAL_ERROR',
  error: mixed,
}

type DispatchedAction =
  | SerialOpenAction
  | SerialReceiveAction
  | SerialErrorAction

type Store = {
  dispatch: Dispatch<DispatchedAction>
}

const serialMiddleware = (serialPort: SerialPort) => (store: Store) => {
  const onOpen = () => {
      store.dispatch({
        type: 'SERIAL_OPEN'
      })
  }

  const onData = (data) => {
    if (typeof data !== 'string') throw 'data must be a string'
    store.dispatch({
      type: 'SERIAL_RECEIVE',
      data,
    })
  }

  const onError = (error) => {
    store.dispatch({
      type: 'SERIAL_ERROR',
      log: 'error',
      error,
    })
  }

  serialPort
    .on('open', onOpen)
    .on('data', onData)
    .on('error', onError)

  serialPort.open()

  return (next: {type: string} => mixed) => (action: {type: string}) => {
    if (action.type === 'SERIAL_SEND') {
      if (typeof action.data !== 'string') throw 'data must be a string'
      serialPort.write(action.data, (err) => {
        if (err) onError(err)
      })
    }
    return next(action)
  }
}

export default serialMiddleware
