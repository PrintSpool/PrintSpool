import fs from 'fs'
import SerialPort from 'serialport'
import simulator from './simulator'

const createSerialPort = (config) => {
  const {
    path,
    baudRate,
    simulation,
  } = config.driver.serialPort
  const serialOptions = {
    autoOpen: false,
    baudRate,
  }
  const { serialPort, parser, isConnected } = (() => {
    if (simulation) {
      return simulator(path, serialOptions)
    }
    const serialPort = new SerialPort(path, serialOptions)
    const parser = serialPort.pipe(new SerialPort.parsers.Readline())
    const isConnected = () => fs.existsSync(path)
    return { serialPort, parser, isConnected }
  })()

  serialPort.on('open', () => {
    console.error('Serial port connected')
  })

  serialPort.on('error', (err) => {
    console.error('Serial port error')
    throw err
  })

  return {
    serialPort,
    serialOptions,
    parser,
    isConnected,
    path,
    baudRate,
  }
}

export default createSerialPort
