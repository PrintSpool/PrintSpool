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
  const { serialPort, parser } = (() => {
    if (simulation) {
      return simulator(path, serialOptions)
    }
    const serialPort = new SerialPort(path, serialOptions)
    const parser = serialPort.pipe(new SerialPort.parsers.Readline())
    return { serialPort, parser }
  })()

  serialPort.on('open', () => {
    console.error('Serial port connected')
  })

  serialPort.on('close', (err) => {
    console.error('Serial port disconnected. Shutting down.')
    process.exit(0)
  })

  serialPort.on('error', (err) => {
    console.error('Serial port error')
    throw err
  })

  return {
    serialPort,
    serialOptions,
    parser,
    path,
    baudRate
  }
}

export default createSerialPort
