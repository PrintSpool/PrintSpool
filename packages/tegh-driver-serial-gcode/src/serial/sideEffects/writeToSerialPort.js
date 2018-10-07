const writeToSerialPort = async ({ serialPort, line }) => {
  await serialPort.write(line)
}

export default writeToSerialPort
