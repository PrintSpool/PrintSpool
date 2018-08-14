import { SERIAL_OPEN_REQUEST } from '../actions/serialOpenRequest'
import serialOpen from '../actions/serialOpen'
import serialOpenError from '../actions/serialOpenError'
import serialClose from '../actions/serialClose'
import { SERIAL_SEND } from '../actions/serialSend'
import serialReceive from '../actions/serialReceive'
import serialError from '../actions/serialError'
import { SERIAL_RESET } from '../actions/serialReset'

const serialMiddleware = ({
  serialPort,
  parser,
  receiveParser,
  isConnected,
}) => (store) => {
  const waitForConnection = () => {
    if (isConnected()) {
      try {
        serialPort.open()
        return
      } catch(error) {
        store.dispatch(serialOpenError({ error }))
      }
    }
    setTimeout(waitForConnection, 200)
  }
  setImmediate(waitForConnection)

  const onOpen = () => {
    store.dispatch(serialOpen())
  }

  const onClose = () => {
    const { resetByMiddleware } = serialPort

    if (!resetByMiddleware) {
      parser.buffer = Buffer.alloc(0)
    }

    store.dispatch(serialClose({ resetByMiddleware }))

    if (!resetByMiddleware) {
      waitForConnection()
    }
  }

  const onData = (data) => {
    if (typeof data !== 'string') throw 'data must be a string'
    store.dispatch(serialReceive({ data: receiveParser(data) }))
  }

  const onError = (error) => {
    store.dispatch(serialError({ error }))
  }

  serialPort.on('open', onOpen)
  serialPort.on('close', onClose)

  const dataHandler = (parser || serialPort)
    .on('error', onError)
    .on('data', onData)

  return next => (action) =>  {
    if (action.type === SERIAL_SEND) {
      const { line } = action.payload

      if (typeof line !== 'string') throw new Error('line must be a string')

      serialPort.write(line, (err) => {
        if (err) onError(err)
      })

    } else if (action.type === SERIAL_OPEN_REQUEST) {
      serialPort.open()

    } else if (action.type === SERIAL_RESET) {
      serialPort.resetByMiddleware = true

      serialPort.close(err => {
        if (err) return onError(err)

        parser.buffer = Buffer.alloc(0)
        delete serialPort.resetByMiddleware

        serialPort.open()
      })
    }

    return next(action)
  }
}

export default serialMiddleware
