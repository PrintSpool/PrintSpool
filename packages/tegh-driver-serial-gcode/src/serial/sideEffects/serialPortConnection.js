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
