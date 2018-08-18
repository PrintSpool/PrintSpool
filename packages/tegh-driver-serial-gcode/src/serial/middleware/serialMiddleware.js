import {
  LOAD_PLUGINS,
  UNLOAD_PLUGINS,
} from 'tegh-server'
import packageJSON from '../../../package.json'

import serialOpen from '../actions/serialOpen'
import serialOpenError from '../actions/serialOpenError'
import serialClose from '../actions/serialClose'
import { SERIAL_SEND } from '../actions/serialSend'
import serialReceive from '../actions/serialReceive'
import serialError from '../actions/serialError'
import { SERIAL_RESET } from '../actions/serialReset'
import createSerialPort from '../createSerialPort'

const serialMiddleware = (store) => {
  let serial = null
  let waitForConnectionTimeout = null

  const waitForConnection = () => {
    if (serial.isConnected()) {
      try {
        serial.serialPort.open()
        return
      } catch (error) {
        store.dispatch(serialOpenError({ error }))
      }
    }
    waitForConnectionTimeout = setTimeout(waitForConnection, 200)
  }

  const onOpen = () => {
    store.dispatch(serialOpen())
  }

  const onClose = () => {
    const { resetByMiddleware } = serial.serialPort

    serial.parser.buffer = Buffer.alloc(0)

    store.dispatch(serialClose({ resetByMiddleware }))

    if (resetByMiddleware) {
      delete serial.serialPort.resetByMiddleware
      serial.serialPort.open()
    } else {
      waitForConnection()
    }
  }

  const onData = (data) => {
    if (typeof data !== 'string') throw new Error('data must be a string')
    store.dispatch(serialReceive(serial.receiveParser(data)))
  }

  const onError = (error) => {
    store.dispatch(serialError({ error }))
  }

  const load = (config) => {
    serial = createSerialPort(config)
    setImmediate(waitForConnection)

    serial.serialPort.on('open', onOpen)
    serial.serialPort.on('close', onClose)

    serial.parser
      .on('error', onError)
      .on('data', onData)
  }

  const unload = async () => {
    if (serial != null) {
      if (waitForConnectionTimeout != null) {
        clearTimeout(waitForConnectionTimeout)
        waitForConnectionTimeout = null
      }

      serial.serialPort.removeEventListener('open', onOpen)
      serial.serialPort.removeEventListener('close', onClose)
      serial.parser.removeEventListener('error', onError)
      serial.parser.removeEventListener('data', onData)

      store.dispatch(serialClose())

      if (serial.serialPort.isOpen) {
        await serial.serialPort.close()
      }
    }
  }

  return next => (action) => {
    if (serial == null) return next(action)

    switch (action.type) {
      case LOAD_PLUGINS: {
        if (action.payload.plugins.includes(packageJSON.name)) {
          load()
        }

        return next(action)
      }
      case UNLOAD_PLUGINS: {
        if (action.payload.plugins.includes(packageJSON.name)) {
          unload()
        }

        return next(action)
      }
      case SERIAL_SEND: {
        const { line } = action.payload

        if (typeof line !== 'string') throw new Error('line must be a string')

        serial.serialPort.write(line, (err) => {
          if (err) onError(err)
        })

        return next(action)
      }
      case SERIAL_RESET: {
        serial.serialPort.resetByMiddleware = true
        serial.serialPort.close()

        return next(action)
      }
      default: {
        return next(action)
      }
    }
  }
}

export default serialMiddleware
