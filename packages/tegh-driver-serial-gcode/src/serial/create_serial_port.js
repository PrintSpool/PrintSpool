import SerialPort from 'serialport'

const createSerialPort = (config) => {
  const {
    path,
    baudRate,
  } = config.driver.serialPort
  const serialOptions = {
    autoOpen: false,
    baudRate,
  }
  const serialPort = new SerialPort(path, serialOptions)
  const parser = serialPort.pipe(new SerialPort.parsers.Readline())

  return {
    serialPort,
    serialOptions,
    parser,
    path,
    baudRate
  }
}

export default createSerialPort
