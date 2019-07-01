const writeToSerialPort = async ({
  serialPort,
  line,
  macro,
  args,
}) => {
  await serialPort.write(line, null, { macro, args })
}

export default writeToSerialPort
