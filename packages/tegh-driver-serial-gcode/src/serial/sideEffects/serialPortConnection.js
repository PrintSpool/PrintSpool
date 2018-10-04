import { SerialPort } from 'tegh-core'

import serialOpen from '../actions/serialOpen'
import serialClose from '../actions/serialClose'
import { SERIAL_SEND } from '../actions/serialSend'
import serialReceive from '../actions/serialReceive'
import serialError from '../actions/serialError'
import { SERIAL_RESET } from '../actions/serialReset'

const serialPortConnection = async ({
  serialPortID,
  baudRate,
  receiveParser,
  simulator,
}, dispatch) => {
  const serialOptions = {
    autoOpen: false,
    baudRate,
  }

  const { serialPort, parser } = (() => {
    if (simulator != null) {
      return simulator(serialPortID, serialOptions)
    }
    const result = {}
    result.serialPort = new SerialPort(path, serialOptions)
    result.parser = result.serialPort.pipe(new SerialPort.parsers.Readline())
    return result
  })()

  let removeEventListeners = null

  const onOpen = () => dispatch(serialOpen({ serialPortID }))
  const onClose = () => {
    removeEventListeners()
    dispatch(serialClose({ serialPortID }))
  }
  const onError = (error) => {
    removeEventListeners()
    dispatch(serialError({ serialPortID, error }))
  }
  const onData = (data) => {
    dispatch(serialReceive({ serialPortID, receiveParser, data }))
  }

  removeEventListeners = () => {
    serialPort.removeEventListener('open', onOpen)
    serialPort.removeEventListener('close', onClose)
    parser.removeEventListener('error', onError)
    parser.removeEventListener('data', onData)
  }

  serialPort
    .on('open', onOpen)
    .on('close', onClose)

  parser
    .on('error', onError)
    .on('data', onData)

  return serialPort
}

export default serialPortConnection
