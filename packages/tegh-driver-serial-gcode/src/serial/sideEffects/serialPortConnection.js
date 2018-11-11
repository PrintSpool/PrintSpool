import { SerialPort } from 'tegh-core'

import serialOpen from '../actions/serialOpen'
import serialClose from '../actions/serialClose'
import serialReceive from '../actions/serialReceive'
import serialError from '../actions/serialError'

const serialPortConnection = ({
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
    result.serialPort = new SerialPort(serialPortID, serialOptions)
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
    serialPort.removeListener('open', onOpen)
    serialPort.removeListener('close', onClose)
    parser.removeListener('error', onError)
    parser.removeListener('data', onData)
  }

  serialPort
    .on('open', onOpen)
    .on('close', onClose)

  parser
    .on('error', onError)
    .on('data', onData)

  serialPort.open()

  return { serialPort, parser }
}

export default serialPortConnection
