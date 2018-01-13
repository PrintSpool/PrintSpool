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

  return {
    serialPort,
    serialOptions,
    parser,
    path,
    baudRate
  }
}

export default createSerialPort
