// @flow
import type {Dispatch} from 'redux'

type SerialPort = {
  open: () => void,
  on:
    | ('open', (_: ?string) => void) => SerialPort
    | ('data', (string) => void) => SerialPort
    | ('error', (string) => void) => SerialPort,
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
  error: string,
}

type Action =
  | SerialOpenAction
  | SerialSendAction
  | SerialReceiveAction
  | SerialErrorAction

type Store = {
  dispatch: Dispatch<Action>
}

const serialMiddleware = (serialPort: SerialPort) => (store: Store) => {
  const onOpen = (err) => {
      store.dispatch({
        type: 'SERIAL_OPEN'
      })
  }

  const onData = (data) => {
    store.dispatch({
      type: 'SERIAL_RECEIVE',
      data
    })
  }

  const onError = (error) => {
    store.dispatch({
      type: 'SERIAL_ERROR',
      error,
    })
  }

  serialPort
    .on('open', onOpen)
    .on('data', onData)
    .on('error', onError)

  serialPort.open()

  return (next: (SerialSendAction) => void) => (action: SerialSendAction) => {
    if (action.type === 'SERIAL_SEND') {
      serialPort.write(action.data, (err) => {
        if (err) onError(err)
      })
    }
    return next(action)
  }
}

export default serialMiddleware
