import { SerialPort } from 'tegh-core'

import serialOpen from '../actions/serialOpen'
import serialClose from '../actions/serialClose'
import serialReceive from '../actions/serialReceive'
import serialError from '../actions/serialError'

const serialPortConnection = ({
  portID,
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
      return simulator(portID, serialOptions)
    }
    const result = {}
    result.serialPort = new SerialPort(portID, serialOptions)
    result.parser = result.serialPort.pipe(new SerialPort.parsers.Readline())
    return result
  })()

  let removeEventListeners = null

  const onOpen = () => dispatch(serialOpen({ portID }))
  const onClose = () => {
    removeEventListeners()
    dispatch(serialClose({ portID }))
  }
  const onError = (error) => {
    removeEventListeners()
    dispatch(serialError({ portID, error }))
  }
  const onData = (data) => {
    dispatch(serialReceive({ portID, receiveParser, data }))
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

  serialPort.open()

  return { serialPort, parser }
}

export default serialPortConnection
